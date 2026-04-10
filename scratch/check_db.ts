import { prisma } from "./src/lib/prisma";

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  const clubs = await prisma.club.findMany();
  console.log("Clubs:", clubs);
}

check();
