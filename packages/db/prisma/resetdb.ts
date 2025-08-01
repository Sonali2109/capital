import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function reset() {
  try {
    await prisma.ticketVerification.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.eventSlot.deleteMany();
    await prisma.event.deleteMany();
    await prisma.card.deleteMany();
    await prisma.jwtToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();

    console.log('All tables cleared');
  } catch (error) {
    console.error('Failed to reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
