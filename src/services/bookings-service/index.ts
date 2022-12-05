import { notFoundError, requestError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import paymentRepository from "@/repositories/payment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import httpStatus from "http-status";

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if(!booking) throw notFoundError();

  const book = await bookingRepository.findBookings(booking.id);

  return book;
}

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  const payment = await paymentRepository.findPaymentByTicketId(ticket.id);

  if(ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || !payment ) throw requestError(httpStatus.FORBIDDEN, "FORBIDDEN");

  const room = await bookingRepository.isRoomAvailable(roomId);

  const howManyBooked = await bookingRepository.findHowManyIsBookedInRoom(roomId);

  if (room.capacity === howManyBooked.length) throw requestError(httpStatus.FORBIDDEN, "FORBIDDEN");
    
  const booking: object = await bookingServices.createBooking(userId, roomId);

  return booking;
}

async function updateBooking(roomId: number, userId: number, bookingId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if(!booking) throw notFoundError;

  const room = await bookingRepository.isRoomAvailable(roomId);

  const howManyBooked = await bookingRepository.findHowManyIsBookedInRoom(roomId);

  if (!room || room.capacity === howManyBooked.length) throw requestError(httpStatus.FORBIDDEN, "FORBIDDEN");

  const update = await bookingRepository.updateBooking(bookingId, userId, roomId);

  return update;
}

const bookingServices = {
  getBooking,
  createBooking,
  updateBooking
};

export default bookingServices;
