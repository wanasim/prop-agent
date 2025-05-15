"use client";

import { IconBrandDiscord, IconBrandGoogle } from "@tabler/icons-react";
import { createFormHook, createFormHookContexts, useForm } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { signUp } from "../_action";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const { fieldContext, formContext, useFormContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const signupresult = await signUp(value);
      console.log("signupresult", signupresult);
      // Then sign in the user
      console.log("signing in?", value);
      const result = await signIn("credentials", {
        email: value.email,
        password: value.password,
        redirect: true,
        callbackUrl: "/onboarding",
      });

      console.log("succesfuly signed in", result);

      if (result?.error) {
        throw new Error(result.error);
      }
      console.log("pushing to onboarding");
      // router.push("/onboarding");
      // try {
      //   const response = await fetch("/api/auth/register", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(value),
      //   });

      //   if (!response.ok) {
      //     const data = await response.json();
      //     throw new Error(data.message || "Something went wrong");
      //   }

      //   // Sign in the user after successful registration
      //   const result = await signIn("credentials", {
      //     email: value.email,
      //     password: value.password,
      //     redirect: false,
      //   });

      //   if (result?.error) {
      //     throw new Error(result.error);
      //   }

      //   window.location.href = "/dashboard";
      // } catch (error) {
      //   setError(error instanceof Error ? error.message : "Something went wrong");
      // }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join Prop Agent to start managing your properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email Sign Up Form */}
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="space-y-4"
              >
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      const result = formSchema.shape.name.safeParse(value);
                      console.log("result", result);
                      return result.success ? undefined : result.error.issues?.[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="John Doe"
                        disabled={form.state.isSubmitting}
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => {
                      const result = formSchema.shape.email.safeParse(value);
                      console.log("result", result);
                      return result.success ? undefined : result.error.issues?.[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="name@example.com"
                        disabled={form.state.isSubmitting}
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) => {
                      const result = formSchema.shape.password.safeParse(value);
                      return result.success ? undefined : result.error.issues?.[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={form.state.isSubmitting}
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {error && <div className="text-sm text-destructive">{error}</div>}
                <form.AppForm>
                  <Button
                    type="submit"
                    className="w-full bg-primary"
                    disabled={form.state.isSubmitting}
                    onClick={() => form.handleSubmit()}
                  >
                    {form.state.isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form.AppForm>
              </form>
            </div>

            {/* OAuth Providers */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/dashboard",
                    state: JSON.stringify({ userType: "OWNER" }),
                  })
                }
              >
                <IconBrandGoogle className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  signIn("discord", {
                    callbackUrl: "/dashboard",
                    state: JSON.stringify({ userType: "OWNER" }),
                  })
                }
              >
                <IconBrandDiscord className="mr-2 h-4 w-4" />
                Sign up with Discord
              </Button>
            </div>
          </div>
          <p className="mt-6 text-center text-muted-foreground text-sm">
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
