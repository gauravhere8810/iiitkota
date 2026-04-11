import { prisma } from "./prisma";

export async function syncResourceStatuses() {
  const now = new Date();
  
  // 1. Find all APPROVED bookings that have already ended
  const expiredBookings = await prisma.resourceBooking.findMany({
    where: {
      status: "APPROVED",
      endTime: { lt: now },
    },
  });

  if (expiredBookings.length === 0) return;

  // 2. Mark these bookings as RETURNED
  await prisma.resourceBooking.updateMany({
    where: {
      id: { in: expiredBookings.map((b) => b.id) },
    },
    data: { status: "RETURNED" },
  });

  // 3. For each affected resource, check if it should become AVAILABLE
  const resourceIds = [...new Set(expiredBookings.map((b) => b.resourceId))];

  for (const resourceId of resourceIds) {
    const activeBooking = await prisma.resourceBooking.findFirst({
      where: {
        resourceId,
        status: "APPROVED",
        startTime: { lte: now },
        endTime: { gt: now },
      },
    });

    if (!activeBooking) {
      await prisma.resource.update({
        where: { id: resourceId },
        data: { status: "AVAILABLE" },
      });
    }
  }
}
