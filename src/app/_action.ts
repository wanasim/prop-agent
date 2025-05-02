"use server";

import { z } from "zod";
import { actionProcedure } from "~/server/api/trpc";

/** redundant create Action to createProcedure.
 * Using it to test out server actions w/ tRPC.
 */
export const createProperty = actionProcedure
  .input(z.object({ name: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.property.create({
      data: {
        name: input.name,
        createdBy: { connect: { id: ctx.session.user.id } },
      },
    });
  });
