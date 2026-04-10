import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Modular University",
      description: "A premier institution for technical and cultural excellence.",
    },
  });

  // 2. Create Clubs
  const clubsData = [
    { name: "Robotics Club", category: "TECHNICAL", accentColor: "#ef4444", description: "Building the future, one bot at a time." },
    { name: "Coding Club", category: "TECHNICAL", accentColor: "#3b82f6", description: "Solving problems through code." },
    { name: "Photography Club", category: "CULTURAL", accentColor: "#10b981", description: "Capturing moments that last forever." },
    { name: "Dance Club", category: "CULTURAL", accentColor: "#f59e0b", description: "Expressing rhythm and emotion." },
    { name: "Music Club", category: "CULTURAL", accentColor: "#8b5cf6", description: "Harmony in every note." },
    { name: "Literature Club", category: "CULTURAL", accentColor: "#ec4899", description: "The art of words and stories." },
  ];

  const clubs = await Promise.all(
    clubsData.map((club) =>
      prisma.club.create({
        data: {
          ...club,
          organizationId: org.id,
        },
      })
    )
  );

  const [robotics, coding, photography, dance, music, literature] = clubs;

  // 3. Create Users (Proxy Users)
  const usersData = [
    { name: "Dr. Alice Smith", email: "head@uni.edu", bio: "Vice Chancellor of Modular University", skills: "Leadership, Strategy" },
    { name: "Prof. Bob Jones", email: "faculty@uni.edu", bio: "In-charge of Studen Affairs", skills: "Mentorship, Planning" },
    { name: "Charlie Dev", email: "coding.head@uni.edu", bio: "Full-stack developer and competitive programmer", skills: "Next.js, Rust, Algorithms" },
    { name: "Dana Photo", email: "photo.head@uni.edu", bio: "Professional photographer and visual artist", skills: "Adobe Suite, Composition" },
    { name: "Eve Coder", email: "coding.core@uni.edu", bio: "Frontend enthusiast", skills: "React, CSS" },
    { name: "Frank Student", email: "student@uni.edu", bio: "Exploring various interests", skills: "Curiosity" },
  ];

  const users = await Promise.all(
    usersData.map((u) => prisma.user.create({ data: u }))
  );

  const [head, faculty, codingHead, photoHead, codingCore, generalStudent] = users;

  // 4. Create Memberships
  await prisma.membership.createMany({
    data: [
      { userId: head.id, clubId: coding.id, role: "HEAD", status: "ACTIVE" }, // Head is technically over everything but let's give membership
      { userId: codingHead.id, clubId: coding.id, role: "HEAD", status: "ACTIVE" },
      { userId: photoHead.id, clubId: photography.id, role: "HEAD", status: "ACTIVE" },
      { userId: codingCore.id, clubId: coding.id, role: "CORE", status: "ACTIVE" },
      { userId: generalStudent.id, clubId: coding.id, role: "GENERAL", status: "ACTIVE" },
      { userId: generalStudent.id, clubId: photography.id, role: "GENERAL", status: "ACTIVE" },
    ],
  });

  // Organization-level Global Roles are implicitly handled by their email/position in this proxy demo
  // but we can add them as "HEAD" in their respective clubs for UI simplicity if needed.

  // 5. Create Resources
  await prisma.resource.createMany({
    data: [
      { clubId: robotics.id, name: "Industrial Arm", type: "PHYSICAL", status: "AVAILABLE", description: "6-axis robotic arm", qrCode: "ROB-ARM-001" },
      { clubId: coding.id, name: "Innovation Lab", type: "SPACE", status: "AVAILABLE", description: "High-end PCs with dual monitors", qrCode: "COD-LAB-001" },
      { clubId: photography.id, name: "Sony A7IV", type: "PHYSICAL", status: "IN_USE", description: "Mirrorless Camera", qrCode: "PH-CAM-001" },
      { clubId: photography.id, name: "Studio Hall", type: "SPACE", status: "AVAILABLE", description: "Equipped with green screen", qrCode: "PH-HALL-001" },
    ],
  });

  // 6. Create Announcements
  await prisma.announcement.createMany({
    data: [
      { clubId: coding.id, title: "Hackathon 2026", content: "Registration is now open for the annual hackathon!", priority: "HIGH", authorId: codingHead.id, channel: "FORMAL", isPinned: true },
      { clubId: coding.id, title: "Weekly Meetup", content: "Join us this Friday for a session on Web3.", authorId: codingHead.id, channel: "INFORMAL" },
    ],
  });

  // 7. Create Events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.event.create({
    data: {
      clubId: coding.id,
      title: "Code & Coffee",
      description: "A casual coding session at the cafeteria.",
      venue: "Main Cafeteria",
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
    },
  });

  // 8. Create Poll
  await prisma.poll.create({
    data: {
      clubId: photography.id,
      title: "Next Workshop Theme?",
      description: "Vote for what you want to learn next.",
      authorId: photoHead.id,
      expiresAt: nextWeek,
      options: {
        create: [
          { text: "Night Photography" },
          { text: "Portrait Lighting" },
          { text: "Street Photography" },
        ],
      },
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
