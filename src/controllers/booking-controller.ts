import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingServices from "@/services/bookings-service";
import { notFoundError, requestError, unauthorizedError } from "@/errors";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingServices.getBooking(Number(userId));
    return res.status(httpStatus.OK).send(booking);
  } catch(error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND); 
    }    

    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { userId } = req;

  try {
    if (!roomId || !userId) throw requestError(httpStatus.BAD_REQUEST, "Bad Request Error");

    const booking = await bookingServices.createBooking(Number(userId), Number(roomId));
    return res.status(httpStatus.CREATED).send(booking);
  } catch (error) {
    console.log(error.name);
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND); 
    }    
    
    if (error.name === "RequestError")   {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { userId } = req;
  const { bookingId } = req.params;
  console.log(bookingId);
  try { 
    if (!roomId || !userId) throw requestError(httpStatus.BAD_REQUEST, "Bad Request Error");
        
    const update = await bookingServices.updateBooking(Number(userId), Number(roomId), Number(bookingId));
    return res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND); 
    }    
    
    if (error.name === "RequestError")   {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
