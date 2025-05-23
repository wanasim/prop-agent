import NextAuth from "next-auth";
import { cache } from "react";

import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "~/server/db";
import { authConfig } from "./config";

/** Manually create separate auth instance for server
 * (i.e. server components, etc.) */
const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({ ...authConfig, adapter: PrismaAdapter(db) as Adapter });

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
