"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export default function SignUpPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px] max-w-[90vw]">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join Prop Agent to start managing your properties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/dashboard",
                state: JSON.stringify({ userType: "OWNER" }),
              })
            }
            disabled={!termsAccepted}
          >
            Create Account with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/signin" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
