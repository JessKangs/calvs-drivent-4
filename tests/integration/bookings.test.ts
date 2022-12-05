import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import { 
  createUser, 
  createHotel, 
  createRoomWithHotelId,
  createSession
} from "../factories";
import * as jwt from "jsonwebtoken";
import { createBooking } from "../factories/bookings-factory";
import { prisma } from "@/config";

beforeAll(async () => {
  await init();
});
 
beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /bookings", () => {
  it("should responde with status 401 if no token is given", async () => {
    const response = await server.get("/bookings");
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should response with 401 if given token is invalid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);
   
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should response with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should response with status 404 if user doesnt have reservation", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);    

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    }); 
   
    it("should responde with status 200 if process succeeded", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id); 
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);  
   
      expect(response.status).toEqual(httpStatus.OK);
      
      expect(response.body).toEqual([
        {
          id: booking.id,
          userId: user.id,
          roomId: room.id,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString()
          },
          createdAt: booking.createdAt.toISOString(),
          updatedAt: booking.updatedAt.toISOString()
        }
      ]);
    });
  });
});

describe("POST /bookings", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/bookings");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when body is not present", async () => {
      const token = await generateValidToken();

      const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
      it("should respond with status 201 and create new booking if there is not any", async () => {
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id); 

        const token = await generateValidToken();
        const session = await createSession(token);

        const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`).send({
          userId: session.userId,
          roomId: room.id
        });
        console.log(response.forbidden);

        expect(response.status).toBe(httpStatus.CREATED);
        const booking = await prisma.booking.findFirst({ where: { userId: session.userId } });
      });
    });
  });
});

describe("PUT /bookings/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/bookings/:bookingId");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.put("/bookings/:bookingId").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.put("/bookings/:bookingId").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when body is not present", async () => {
      const token = await generateValidToken();

      const response = await server.put("/bookings/:bookingId").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.put("/bookings/:bookingId").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
      it("should respond with status 201 and update booking", async () => {
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id); 

        const token = await generateValidToken();

        const response = await server.put("/bookings/:bookingId").set("Authorization", `Bearer ${token}`).send({
          roomId: room.id
        });

        expect(response.status).toBe(httpStatus.OK);
      });
    });
  });
});
