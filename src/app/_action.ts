"use server";

import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { protectedActionProcedure, publicActionProcedure } from "~/server/api/trpc";

/** redundant create Action to createProcedure.
 * Using it to test out server actions w/ tRPC.
 */
export const createProperty = protectedActionProcedure
  .input(z.object({ name: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.property.create({
      data: {
        name: input.name,
        ownerId: ctx.session.user.id,
      },
    });
  });

export const signUp = publicActionProcedure
  .input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.db.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw new TRPCError({ code: "CONFLICT", message: "User already exists" });
    }
    const hashedPassword = await hash(input.password, 12);

    return ctx.db.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
    });
  });

export const signIn = publicActionProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().nonempty(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const isPasswordValid = await compare(input.password, user.password as string);

    if (!isPasswordValid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
    }

    return user;
  });
