import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const propertyRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.property.create({
        data: {
          name: input.name,
          ownerId:  ctx.session.user.id,
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const property = await ctx.db.property.findFirst({
      orderBy: { createdAt: "desc" },
      where: { ownerId: ctx.session.user.id } ,
    });

    return property ?? null;
  }),

  getAllProperties: protectedProcedure.query(async ({ ctx }) => {
    const properties = await ctx.db.property.findMany();

    return properties;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
