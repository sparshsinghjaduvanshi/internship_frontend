"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    open: boolean;
    onComplete: () => void;
    onCancel: () => void;
}

export default function ProfileCompletionDialog({ open, onComplete, onCancel }: Props) {

    const { user, login } = useUser();
    const [phone, setPhone] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const states = [
        "Tamil Nadu",
        "Kerala",
        "Karnataka",
        "Andhra Pradesh",
        "Telangana",
        "Rajasthan",
        "Uttar Pradesh",
        "Delhi",
        "Punjab",
        "Haryana",
        "Gujarat",
        "Maharashtra",
    ];

    const handleSave = async () => {

        if (!phone || !state || !city) {
            alert("Please fill all fields");
            return;
        }
        try {
            setLoading(true);
            const res =
                await axiosInstance.patch(
                    `/user/update/${user._id}`,
                    {
                        phone,
                        state,
                        city
                    }
                );

            login(res.data);
            // await axiosInstance.post(
            //     "/user/send-otp",
            //     {
            //         userId: res.data._id,
            //     }
            // );
            onComplete();
        } catch (error) {
            console.log(error);
            alert(
                "Failed to save profile"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (!open) return;

        const handlePopState = () => {

            onCancel();
        };

        window.addEventListener(
            "popstate",
            handlePopState
        );

        return () => {

            window.removeEventListener(
                "popstate",
                handlePopState
            );
        };

    }, [open, onCancel]);
    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Complete Your Profile
                    </DialogTitle>

                </DialogHeader>

                <div className="space-y-4">

                    <div>
                        <Label>
                            Phone Number
                        </Label>

                        <Input
                            value={phone}
                            onChange={(e) =>
                                setPhone(
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label>
                            City
                        </Label>

                        <Input
                            value={city}
                            onChange={(e) =>
                                setCity(e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>
                            State
                        </Label>

                        <select
                            className=" w-full border rounded p-2 bg-background text-foreground "
                            value={state}
                            onChange={(e) => setState(e.target.value)
                            }
                        >
                            <option value="" className="bg-background text-foreground">
                                Select State
                            </option>

                            {states.map((s) => (
                                <option key={s} value={s} className="bg-background text-foreground">

                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Save & Continue"}
                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    );
}