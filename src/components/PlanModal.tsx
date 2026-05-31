"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelectPlan: (
        plan: string,
        amount: number
    ) => void;
}

export default function PlanModal({
    open,
    onClose,
    onSelectPlan,
}: Props) {

    const plans = [
        {
            name: "bronze",
            price: 10,
            limit: "7 Minutes",
        },

        {
            name: "silver",
            price: 50,
            limit: "10 Minutes",
        },

        {
            name: "gold",
            price: 100,
            limit: "Unlimited",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>

                <DialogHeader>
                    <DialogTitle>
                        Upgrade Your Plan
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    {plans.map((plan) => (

                        <div
                            key={plan.name}
                            className="border rounded-lg p-4"
                        >

                            <h2 className="text-lg font-bold capitalize">
                                {plan.name}
                            </h2>

                            <p>
                                ₹{plan.price}
                            </p>

                            <p>
                                Watch Limit:
                                {plan.limit}
                            </p>

                            <Button
                                className="mt-2 w-full"
                                onClick={() =>
                                    onSelectPlan(
                                        plan.name,
                                        plan.price
                                    )
                                }
                            >
                                Choose Plan
                            </Button>

                        </div>
                    ))}

                </div>
            </DialogContent>
        </Dialog>
    );
}