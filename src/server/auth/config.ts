import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env";
import { db } from "~/server/db";

export type UserType = "TENANT" | "OWNER";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      userType: UserType | null;
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    // role: UserRole;
    userType: UserType | null;
  }

  interface JWT {
    userType: UserType | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("AUTHORIZE CREDENTIALS", credentials);
        /** Authorize callback is invoked when leveraging NextAuth 'signIn' function
         * FYI: the 'signUp' server action does not make use of 'signIn' to separate concerns.
         * Instead, 'signUp' will manually create the user in the db and redirect to 'onboarding'
         */
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    // newUser: "/onboarding",
  },
  callbacks: {
    /** ToDo: handle existing users for OAuth Providers. This will  */
    // async signIn({ user, account, profile }) {
    //   // Check if user exists
    //   const existingUser = await db.user.findUnique({
    //     where: { email: user.email as string },
    //   });

    //   // If user doesn't exist, redirect to signup
    //   if (!existingUser) {
    //     return `/signup?email=${user.email}&name=${user.name}`;
    //   }

    //   return true;
    // },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          userType: token.userType as UserType | null,
        },
      };
    },
    jwt: ({ token, user }) => {
      console.log("user", user);
      console.log("token", token);
      if (user?.userType) {
        token.userType = user.userType;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
