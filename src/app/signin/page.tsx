"use client";

import { IconBrandDiscord, IconBrandGoogle } from "@tabler/icons-react";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().nonempty("Please enter a password"),
});

const { fieldContext, formContext, useFormContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      console.log("value", value);
      try {
        const result = await signIn("credentials", {
          email: value.email,
          password: value.password,
          redirect: false,
        });
        console.log("result", result);

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push("/dashboard");
      } catch (error) {
        console.log("error!@#!@#", error);
        setError(error instanceof Error ? error.message : "Something went wrong");
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email Sign In Form */}
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => {
                      const result = formSchema.shape.email.safeParse(value);
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
                  >
                    {form.state.isSubmitting ? "Signing in..." : "Sign In"}
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
                  })
                }
              >
                <IconBrandGoogle className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  signIn("discord", {
                    callbackUrl: "/dashboard",
                  })
                }
              >
                <IconBrandDiscord className="mr-2 h-4 w-4" />
                Sign in with Discord
              </Button>
            </div>
          </div>
          <p className="mt-6 text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
