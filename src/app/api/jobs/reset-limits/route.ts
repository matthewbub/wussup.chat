// this should reset the daily limit for chats
// todo remove the monthly limit - its redundant
// todo deprecate the byo api key - its not safe

import { prisma } from "@/lib/prisma";

export const GET = async () => {
  const stats = await prisma.stats.findMany();

  for (const stat of stats) {
    await prisma.stats.update({
      where: { id: stat.id },
      data: { dailyMessageCount: 0, dailyResetDate: new Date() },
    });
  }
};
