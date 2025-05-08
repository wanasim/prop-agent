import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        userType: z.enum(["TENANT", "OWNER"]),
        properties: z
          .array(z.object({ name: z.string() }))
          .optional()
          .default([]),
        selectedProperty: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          userType: input.userType,
          ...(input.userType === "OWNER"
            ? {
                ownedProperties: {
                  create: input.properties.map((property) => ({
                    name: property.name,
                  })),
                },
              }
            : {
                rentedProperties: {
                  connect: { id: input.selectedProperty },
                },
              }),
        },
      });
    }),
});
