const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { studentProfile: true }
  });
  console.log("Users:", JSON.stringify(users, null, 2));

  const results = await prisma.riasecResult.findMany();
  console.log("Results:", JSON.stringify(results, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
