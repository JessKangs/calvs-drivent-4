import { prisma } from "@/config";

//Cria uma reserva na tabela Booking do banco
export async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    }
  });
}
