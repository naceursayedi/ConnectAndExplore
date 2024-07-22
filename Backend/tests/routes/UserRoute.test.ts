import mongoose from "mongoose";
import { clearDatabase, connect } from "../../database/db";
import app from "../../server";
import { IAddress, User } from "../../src/model/UserModel";
import { LoginResource, userResource } from "../../src/Resources";
import { UserService } from "../../src/services/UserService";
import request from "supertest";
const a: IAddress = {
  postalCode: "12345",
  city: "Berlin",
};
const u: userResource = {
  email: "John@doe.com",
  name: {
    first: "John",
    last: "Doe",
  },
  password: "12abcAB!",
  isAdministrator: true,
  address: a,
  birthDate: new Date(),
  gender: "male",
  isActive: true,
  socialMediaUrls: {
    facebook: "facebook",
    instagram: "instagram",
  },
};

const JaneData: userResource = {
  email: "Jane@doe.com",
  name: {
    first: "Jane",
    last: "Doe",
  },
  password: "12abcAB!",
  isAdministrator: false,
  address: a,
  birthDate: new Date(),
  gender: "male",
  isActive: true,
  socialMediaUrls: {
    facebook: "facebook",
    instagram: "instagram",
  },
};

const userService: UserService = new UserService();
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";
let admin: userResource;
let AdminToken: string;
let jane: userResource;
let token: string;
let req = request(app);
describe("userRoute test", () => {
  beforeAll(async () => await connect());
  beforeEach(async () => {
    admin = await userService.createUser(u);
    jane = await userService.createUser(JaneData);
    const adminloginData = { email: "John@doe.com", password: "12abcAB!" };
    const adminRes = await req.post(`/api/login`).send(adminloginData);
    const AdminLoginResource = adminRes.body as LoginResource;
    AdminToken = AdminLoginResource.access_token;

    const janeLoginData = { email: "Jane@doe.com", password: "12abcAB!" };
    const janeRes = await req.post(`/api/login`).send(janeLoginData);
    const janeLoginResource = janeRes.body as LoginResource;
    token = janeLoginResource.access_token;
  });
  afterEach(async () => await clearDatabase());
  afterAll(async () => {
    await mongoose.connection.close(); // Perform final cleanup after all tests
  });

  test("getUsers fails on request by non-admin", async () => {
    const response = await req
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(403);
  });

  test("get User request responses with 404 on invalid userID", async () => {
    const response = await req
      .get(`/api/users/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${AdminToken}`);

    expect(response.statusCode).toBe(404);
  });

  test("get User request responses with 400 on undefined userID", async () => {
    const response = await req
      .get(`/api/users/invalidID`)
      .set("Authorization", `Bearer ${AdminToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test("get User returns any user when performed by an admin and returns user when performed by non-admin", async () => {
    const response = await req
      .get(`/api/users/${jane.id}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name.first).toBe(jane.name.first);

    const res = await req
      .get(`/api/users/${jane.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name.first).toBe(jane.name.first);
  });

  test("put user successfully updates user in db and returns updated user information", async () => {
    const newName = "newName";
    jane.name.last = newName;
    const res = await req
      .put(`/api/users/${jane.id}`)
      .send(jane)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name.last).toBe(newName);

    const janeDataFromDB = await User.findById(jane.id).exec();
    expect(janeDataFromDB.name.last).toBe(newName);

    const updatedName = "newName-adminUpdate";
    jane.name.last = updatedName;
    const response = await req
      .put(`/api/users/${jane.id}`)
      .send(jane)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(response.body.name.last).toBe(updatedName);

    const janeDataFromDBAdminUpdate = await User.findById(jane.id).exec();
    expect(janeDataFromDBAdminUpdate.name.last).toBe(updatedName);
  });

  test("should return error on updating email to duplicate email", async () => {
    jane.email = admin.email;
    const res = await req
      .put(`/api/users/${jane.id}`)
      .send(jane)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.statusCode).toBe(404);
  });

  test("should return error on trying to update other users as non-admin", async () => {
    admin.name.first = "newName";
    const res = await req
      .put(`/api/users/${admin.id}`)
      .send(admin)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  test("testing for validation errors on put user route", async () => {
    const invalidUserResource: userResource = {
      email: "",
      name: {
        first: "",
        last: "",
      },
      isAdministrator: false,
      address: a,
      birthDate: jane.birthDate,
      gender: "",
      isActive: true,
    };

    const res = await req
      .put(`/api/users/${jane.id}`)
      .send(invalidUserResource)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("put user with invalid old password returns error", async () => {
    const requestData = jane;
    requestData.oldPassword = "invalidPW123!";
    requestData.password = "newStrongPassword123!";

    const res = await req
      .put(`/api/users/${jane.id}`)
      .send(requestData)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);

    const dbJane = await User.findById(jane.id).exec();
    expect(await dbJane.isCorrectPassword("newPassowrd")).toBeFalsy();
  });

  test("should allow an admin to delete any user", async () => {
    const response = await req
      .delete(`/api/users/${jane.id}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(response.statusCode).toBe(204);
  });

  test("should allow a user to inactivate their own account", async () => {
    const response = await req
      .delete(`/api/users/${jane.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });

  test("should prevent a non-admin user from deleting another user", async () => {
    const response = await req
      .delete(`/api/users/${admin.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(403);
  });

  test("should return an error for an invalid user ID", async () => {
    const response = await req
      .delete(`/api/users/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(response.statusCode).toBe(404);
  });
});
