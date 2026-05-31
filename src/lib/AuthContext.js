import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";
import ProfileCompletionDialog from "@/components/ProfileCompletionDialog";
import OtpDialog from "@/components/OtpDialog";


const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const login = async (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
    await handlePostLogin(
      userdata
    );
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlePostLogin = async (loggedInUser) => {

    // Missing profile?
    if (!loggedInUser.phone || !loggedInUser.state) {
      window.history.pushState(
        null,
        "",
        window.location.href
      );

      setShowProfileDialog(true);
      return;
    }

    // Already verified?
    if (
      !loggedInUser.isVerified
    ) {
      try {
        await axiosInstance.post(
          "/user/send-otp",
          {
            userId:
              loggedInUser._id,
          }
        );
        window.history.pushState(
          null,
          "",
          window.location.href
        );

        setShowOtpDialog(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosInstance.post("/user/login", payload);
          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unsubcribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, login, logout, handlegooglesignin }}
    >
      {children}

      <ProfileCompletionDialog
        open={showProfileDialog}

        onComplete={() => {

          setShowProfileDialog(false);

          window.history.pushState(
            null,
            "",
            window.location.href
          );

          setShowOtpDialog(true);
        }}

        onCancel={() => {

          setShowProfileDialog(false);

          logout();
        }}
      />

      <OtpDialog
        open={showOtpDialog}
        onVerified={() =>
          setShowOtpDialog(false)
        }
        onCancel={() => {
          setShowOtpDialog(false);
          logout();
        }}
      />

    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
