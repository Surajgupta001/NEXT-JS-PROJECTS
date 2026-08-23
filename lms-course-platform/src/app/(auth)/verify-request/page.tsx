"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequestPage() {

    const [emailpending, startTransition] = useTransition();
    const [otp, setOtp] = useState("");
    const params = useSearchParams();
    const email = params.get('email') as string;
    const router = useRouter();
    const isOtpComplete = otp.length === 6;

    function verifyOTP() {
        startTransition(async () => {
            await authClient.signIn.emailOtp({
                email: email,
                otp: otp,
                fetchOptions: {
                    onSuccess: () => {
                        // Handle successful OTP verification
                        toast.success("OTP verified successfully! You are now signed in.");
                        router.push('/');
                    },
                    onError: () => {
                        // Handle OTP verification error
                        toast.error("Invalid OTP. Please try again.");
                    }
                }
            })
        })
    };

    return (
        <Card className="w-full mx-auto">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-xl font-semibold">
                    Please Check Your Email
                </CardTitle>

                <CardDescription className="max-w-sm mx-auto text-sm leading-6">
                    We have sent a verification code to your email. Enter the code below
                    to verify your email address.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        className="gap-2"
                    >
                        <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="text-base size-10" />
                            <InputOTPSlot index={1} className="text-base size-10" />
                            <InputOTPSlot index={2} className="text-base size-10" />
                        </InputOTPGroup>

                        <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={3} className="text-base size-10" />
                            <InputOTPSlot index={4} className="text-base size-10" />
                            <InputOTPSlot index={5} className="text-base size-10" />
                        </InputOTPGroup>
                    </InputOTP>

                    <p className="text-xs text-center text-muted-foreground">
                        Enter the 6-digit code sent to your email.
                    </p>
                </div>

                <Button
                    className="w-full"
                    onClick={verifyOTP}
                    disabled={emailpending || !isOtpComplete}
                >
                    {emailpending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Verifying OTP...</span>
                        </>
                    ) : (
                        <span>Verify OTP</span>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}