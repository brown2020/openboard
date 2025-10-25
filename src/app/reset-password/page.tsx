"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import OpenBoardLogo from "@/images/openboard_logoword.png";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        setErrorMessage(
          errorCode === "auth/user-not-found"
            ? "No account found with this email"
            : "Failed to send reset email. Please try again."
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md w-full mx-4 space-y-8 p-8 bg-card rounded-lg shadow-lg border">
        <div className="flex flex-col items-center">
          <Image
            src={OpenBoardLogo}
            alt="OpenBoard"
            width={200}
            height={60}
            className="h-12 object-contain mb-4"
          />
          <h2 className="text-3xl font-bold text-center">Reset Password</h2>
          <p className="text-muted-foreground mt-2 text-center">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === "success"}
            />
          </div>

          {status === "error" && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {status === "success" && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-md text-sm">
              Reset link sent! Check your email for further instructions.
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" && "Sending..."}
            {status === "success" && "Email Sent"}
            {status !== "loading" && status !== "success" && "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
