import { useEffect } from "react";
import { useUser } from "@/lib/AuthContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";

const ThemeManager = () => {

  const { user } = useUser();

  useEffect(() => {

    const southStates = [
      "Tamil Nadu",
      "Kerala",
      "Karnataka",
      "Andhra Pradesh",
      "Telangana",
    ];

    const hour = Number(
      new Date().toLocaleString(
        "en-US",
        {
          timeZone:
            "Asia/Kolkata",
          hour: "numeric",
          hour12: false,
        }
      )
    );
   
    const shouldUseLightTheme =
    user &&
    southStates.includes(
      user.state
    ) &&
    hour >= 10 &&
    hour < 12;
    
    if (
      shouldUseLightTheme
    ) {
      document.documentElement.classList.remove(
        "dark"
      );
    } else {
      document.documentElement.classList.add(
        "dark"
      );
    }
  }, [user]);
  return null;
};

export default function App({ Component, pageProps }: AppProps) {


  return (
    <UserProvider>
      <ThemeManager />
      <div className="min-h-screen">
        <title>Your-Tube Clone</title>
        <Header />
        <Toaster />
        <div className="flex">
          <Sidebar />
          <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}
