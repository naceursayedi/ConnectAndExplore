import request from "supertest";
import { connect, clearDatabase } from "../../database/db";
import {
  ChatResource,
  LoginResource,
  addressEResource,
  categoryResource,
  eventResource,
  userResource,
} from "../../src/Resources";
import { EventService } from "../../src/services/EventService";
import app from "../../server";
import { UserService } from "../../src/services/UserService";
import mongoose from "mongoose";
import { ChatService } from "../../src/services/ChatService";

const a: addressEResource = {
  street: "Street",
  houseNumber: "1",
  postalCode: "12345",
  city: "Berlin",
  country: "Germany",
};

const c: categoryResource = {
  name: "Hobbys",
  description: "persönliche Interessen, Freizeit",
};

const c1: categoryResource = {
  name: "Sport",
  description: "sportliche Aktivitäten, Spiele, Fitness",
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
  profilePicture: "picture1",
  socialMediaUrls: {
    facebook: "facebook",
    instagram: "instagram",
  },
};

const u2: userResource = {
  email: "test@mail.com",
  name: {
    first: "test",
    last: "name",
  },
  password: "12abcAB!",
  isAdministrator: false,
  address: a,
  birthDate: new Date(),
  gender: "female",
  isActive: true,
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
  profilePicture: "picture1",
  socialMediaUrls: {
    facebook: "facebook",
    instagram: "instagram",
  },
};

const e1: eventResource = {
  name: "Sample Event 1",
  description: "for anyone interested",
  price: 0,
  date: new Date(),
  address: a,
  category: [c],
};

const e2: eventResource = {
  name: "Sample Event 2",
  description: "this is my second gym party",
  price: 100,
  date: new Date(),
  address: a,
  hashtags: ["freizeit"],
  category: [c1],
};

const userService: UserService = new UserService();
const eventService: EventService = new EventService();
const chatService: ChatService = new ChatService();
let admin: userResource;
let AdminToken: string;
let jane: userResource;
let token: string;
let user: userResource;
let uToken: string;
let event1: eventResource;
let event2: eventResource;
let req = request(app);

describe("ChatRoute Tests", () => {
  beforeAll(async () => await connect());
  beforeEach(async () => {
    admin = await userService.createUser(u);
    jane = await userService.createUser(JaneData);
    user = await userService.createUser(u2);
    const adminloginData = { email: "John@doe.com", password: "12abcAB!" };
    const adminRes = await req.post(`/api/login`).send(adminloginData);
    const AdminLoginResource = adminRes.body as LoginResource;
    AdminToken = AdminLoginResource.access_token;

    const janeLoginData = { email: "Jane@doe.com", password: "12abcAB!" };
    const janeRes = await req.post(`/api/login`).send(janeLoginData);
    const janeLoginResource = janeRes.body as LoginResource;
    token = janeLoginResource.access_token;

    const uLoginData = { email: "test@mail.com", password: "12abcAB!" };
    const uRes = await req.post(`/api/login`).send(uLoginData);
    const uLoginResource = uRes.body as LoginResource;
    uToken = uLoginResource.access_token;

    event1 = await eventService.createEvent(e1, jane.id);
    event2 = await eventService.createEvent(e2, user.id);
  });
  afterEach(async () => await clearDatabase());
  afterAll(async () => {
    await mongoose.connection.close(); // Perform final cleanup after all tests
  });

  test("send chat message", async () => {
    let res = await req
      .post(`/api/chat/${event2.chat}`)
      .send({ message: "hallo" })
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.errors).not.toBeDefined();
    const result: ChatResource = res.body;
    expect(result.id).toBe(event2.chat);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].user).toBe(user.id);
    expect(result.messages[0].message).toBe("hallo");
    // invalid authorization
    res = await req
      .post(`/api/chat/${event2.chat}`)
      .send({ message: "hallo" })
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test("get chat", async () => {
    await eventService.joinEvent(admin.id, event2.id);
    await chatService.sendMessage(event2.chat, user.id, "hallo");
    await chatService.sendMessage(event2.chat, admin.id, "hey");
    let res = await req
      .get(`/api/chat/${event2.chat}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.errors).not.toBeDefined();
    const result: ChatResource = res.body;
    expect(result.id).toBe(event2.chat);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].user).toBe(user.id);
    expect(result.messages[0].message).toBe("hallo");
    expect(result.messages[1].user).toBe(admin.id);
    expect(result.messages[1].message).toBe("hey");
    // invalid authorization
    res = await req
      .get(`/api/chat/${event2.chat}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
