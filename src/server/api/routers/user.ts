import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(z.object({ userType: z.enum(["TENANT", "OWNER"]) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { userType: input.userType },
      });
    }),
});
