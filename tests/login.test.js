require("dotenv").config();
const supertest = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");

const { DB_URI_TEST } = process.env;

mongoose.set("strictQuery", false);

const validUser = {
  email: "testUser1@gmail.com",
  password: "1234567",
};

const invalidUser = {
  email: "invalidUser1@gmail.com",
  password: "123456",
};

describe("POST/login", () => {
  let server;
  let response;
  let responseError;

  beforeAll(async () => {
    server = app.listen();
    await mongoose.connect(DB_URI_TEST);
    await supertest(app).post("/api/users/register").send(validUser);
    response = await supertest(app).post("/api/users/login").send(validUser);
    responseError = await supertest(app)
      .post("/api/users/login")
      .send(invalidUser);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await server.close();
    await mongoose.connection.close();
  });

  it("should return status code 200, token and user object on successful login", async () => {
    try {
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.user).toBe("object");
      expect(typeof response.body.user.email).toBe("string");
      expect(typeof response.body.user.subscription).toBe("string");
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  it("should return status code 401 for invalid login", async () => {
    try {
      expect(responseError.status).toBe(401);
      expect(responseError.body.message).toBe("Email or password is wrong!");
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
});
