import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";

export default function FriendsPage() {
    const { user } = useUser();
    const router = useRouter();

    if (!user) {
        return (
            <div className="p-6">
                Please login first
            </div>
        );
    }

    const [friendEmail, setFriendEmail] =
        useState("");

    const [friends, setFriends] =
        useState<any[]>([]);

    const loadFriends = async () => {
        if (!user) return;

        try {
            const res =
                await axiosInstance.get(
                    `/auth/friends/${user._id}`
                );

            setFriends(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadFriends();
    }, [user]);

    const addFriend = async () => {
        try {

            await axiosInstance.post(
                "/auth/add-friend",
                {
                    userId: user?._id,
                    friendEmail,
                }
            );

            setFriendEmail("");

            loadFriends();

        } catch (error) {
            console.log(error);
            alert("Unable to add friend");
        }
    };

    const removeFriend = async (
        friendId: string
    ) => {

        try {

            await axiosInstance.delete(
                "/auth/remove-friend",
                {
                    data: {
                        userId: user?._id,
                        friendId,
                    },
                }
            );

            loadFriends();

        } catch (error) {

            console.log(error);
        }
    };

    const startCall = (
        friendName: string
    ) => {

        const roomId =
            crypto.randomUUID();

        const shouldStart =
            confirm(
                `Start a video call with ${friendName}?`
            );

        if (!shouldStart) return;

        router.push(
            `/call/${roomId}`
        );
    };

    return (
        <div className="p-6 w-full">

            <h1 className="text-2xl font-bold mb-4">
                Friends
            </h1>

            <div className="flex gap-2 mb-6">

                <input
                    type="email"
                    value={friendEmail}
                    onChange={(e) =>
                        setFriendEmail(
                            e.target.value
                        )
                    }
                    placeholder="Friend Email"
                    className="
            border
            rounded
            px-3
            py-2
            flex-1
          "
                />

                <button
                    onClick={addFriend}
                    className="
            bg-blue-500
            text-white
            px-4
            rounded
          "
                >
                    Add Friend
                </button>

            </div>
            {friends.length === 0 && (
                <div className="text-center py-10">
                    No friends added yet
                </div>
            )}
            <div className="space-y-3">

                {friends.map(
                    (friend) => (
                        <div
                            key={friend._id}
                            className="
                border
                rounded
                p-4
                flex
                justify-between
                items-center
              "
                        >

                            <div>

                                <div>
                                    {friend.name}
                                </div>

                                <div
                                    className="
                    text-sm
                    text-gray-500
                  "
                                >
                                    {friend.email}
                                </div>

                            </div>

                            <div className="flex gap-2">

                                <button
                                    onClick={() =>
                                        startCall(friend.name)
                                    }
                                    className="
                    bg-green-500
                    text-white
                    px-3
                    py-1
                    rounded
                  "
                                >
                                    Video Call
                                </button>

                                <button
                                    onClick={() =>
                                        removeFriend(
                                            friend._id
                                        )
                                    }
                                    className="
                    bg-red-500
                    text-white
                    px-3
                    py-1
                    rounded
                  "
                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    )
                )}

            </div>

        </div>
    );
}