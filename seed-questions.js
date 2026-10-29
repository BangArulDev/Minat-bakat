import { PrismaClient } from '@prisma/client';
import { riasecQuestions } from './src/data/riasecQuestions.js';
import { riasecSelfEstimate } from './src/data/riasecSelfEstimate.js';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RIASEC questions...");
  
  // Clear existing
  await prisma.riasecQuestion.deleteMany();
  await prisma.riasecSelfEstimate.deleteMany();

  // Insert questions
  const qResult = await prisma.riasecQuestion.createMany({
    data: riasecQuestions
  });
  console.log(`Seeded ${qResult.count} questions.`);

  // Insert self-estimates
  const sResult = await prisma.riasecSelfEstimate.createMany({
    data: riasecSelfEstimate
  });
  console.log(`Seeded ${sResult.count} self estimates.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
