"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
    open: boolean;
    onVerified: () => void;
    onCancel: () => void;
}

export default function OtpDialog({
    open,
    onVerified,
    onCancel,
}: Props) {

    const { user, login } = useUser();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {

        try {

            setLoading(true);

            const res = await axiosInstance.post(
                "/user/verify-otp",
                {
                    userId: user?._id,
                    otp,
                }
            );

            const updatedUser =
            {
                ...user,
                isVerified: true,
            };

            login(updatedUser);

            alert(
                "OTP Verified Successfully"
            );

            onVerified();

        } catch (error: any) {

            alert(
                error?.response?.data?.message ||
                "Verification Failed"
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
                        OTP Verification
                    </DialogTitle>

                </DialogHeader>

                <div className="space-y-4">

                    <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) =>
                            setOtp(
                                e.target.value
                            )
                        }
                    />

                    <Button
                        className="w-full"
                        onClick={handleVerify}
                        disabled={loading}
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify OTP"}
                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    );
}