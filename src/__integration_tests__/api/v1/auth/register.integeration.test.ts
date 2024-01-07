import supertest, { SuperTest, Test } from "supertest";

import { clearDB } from "@__integration_tests__/jest/db";
import { fakerData, userFactory } from "@__integration_tests__/jest/factories";
import App from "@app";
import { AuthControllerV1 } from "@v1/index";

let server: SuperTest<Test>;
const baseUrl = "/api/v1/auth";

describe("register test suit", () => {
  beforeEach(async () => {
    await clearDB();
    const app = new App([AuthControllerV1]);
    await App.initDB();
    server = supertest(app.getServer());
  });

  test("first name is not empty", async () => {
    const newUser = {
      firstName: "",
      lastName: "lastName",
      email: "notemail@gmail.com",
      password: "12#4qWer",
    };
    const { body } = await server
      .post(`${baseUrl}/register`)
      .send(newUser)
      .expect(400);
    expect(body.message).toBe("firstName should not be empty");
  });

  test("last name is not empty", async () => {
    const newUser = {
      firstName: "firstName",
      lastName: "",
      email: "notemail@gmail.com",
      password: "12#4qWer",
    };
    const { body } = await server
      .post(`${baseUrl}/register`)
      .send(newUser)
      .expect(400);
    expect(body.message).toBe("lastName should not be empty");
  });

  test("email is not valid", async () => {
    const newUser = {
      firstName: "firstName",
      lastName: "lastName",
      email: "notemail",
      password: "12#4qWer",
    };
    const { body } = await server
      .post(`${baseUrl}/register`)
      .send(newUser)
      .expect(400);
    expect(body.message).toBe("email must be an email");
  });

  test("password should at least 8 character", async () => {
    const newUser = {
      firstName: "firstName",
      lastName: "lastName",
      email: fakerData.internet.email(),
      password: "12#4qWe",
    };
    const { body } = await server
      .post(`${baseUrl}/register`)
      .send(newUser)
      .expect(400);
    expect(body.message).toBe(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character,password must be longer than or equal to 8 characters"
    );
  });

  test("password must contain format", async () => {
    const newUser = {
      firstName: "firstName",
      lastName: "lastName",
      email: fakerData.internet.email(),
      password: "11111111",
    };
    const { body } = await server
      .post(`${baseUrl}/register`)
      .send(newUser)
      .expect(400);
    expect(body.message).toBe(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    );
  });

  test("email should be unique", async () => {
    const firstName = "firstName 1";
    const lastName = "lastName 1";
    const email = fakerData.internet.email();
    const password = "12#4qWer";
    await userFactory({ firstName, lastName, email, password });
    const newUser2 = {
      firstName: "firstName 2",
      lastName: "lastName 2",
      email: email,
      password: "12#4qWer",
    };

    const { body } = await server
      .post(`${baseUrl}/register`)
      .send(newUser2)
      .expect(500);
    expect(body.message).toBe("Email already Taken");
  });
});
