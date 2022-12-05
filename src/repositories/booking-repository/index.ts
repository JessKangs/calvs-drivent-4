import { prisma } from "@/config";

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    }
  });
}

async function findBookings(bookingId: number) {
  return prisma.booking.findMany({
    where: {
      id: bookingId
    },
    include: {
      Room: true,
    }
  });
}

async function isRoomAvailable(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    }
  });
}

async function findHowManyIsBookedInRoom(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    }
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function updateBooking(roomId: number, userId: number, bookingId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId, 
      userId
    }
  });
}

const bookingRepository = {
  findHowManyIsBookedInRoom,
  findBookingByUserId,
  isRoomAvailable,
  createBooking,
  updateBooking,
  findBookings
};

export default bookingRepository;
