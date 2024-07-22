import request from "supertest";
import { connect, clearDatabase } from "../../database/db";
import {
  CommentResource,
  CommentsResource,
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
import { CommentService } from "../../src/services/CommentService";

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

const e: eventResource = {
  name: "Sample Event",
  description: "This is my first event",
  price: 10,
  date: new Date(),
  address: a,
  thumbnail: "sampleThumbnail",
  hashtags: ["sport", "freizeit"],
  category: [c, c1],
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
const commentService: CommentService = new CommentService();
let admin: userResource;
let AdminToken: string;
let jane: userResource;
let token: string;
let user: userResource;
let uToken: string;
let event: eventResource;
let event1: eventResource;
let event2: eventResource;
let comment: CommentResource;
let req = request(app);

describe("CommentsRoute Tests", () => {
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

    event = await eventService.createEvent(e, admin.id);
    event1 = await eventService.createEvent(e1, jane.id);
    event2 = await eventService.createEvent(e2, user.id);

    comment = {
      title: "Sample Comment",
      stars: 1,
      content: "this is my comment",
      edited: true,
      creator: user.id,
      event: event.id,
    };
  });
  afterEach(async () => await clearDatabase());
  afterAll(async () => {
    //closeServer(); // Close the server after all tests
    await mongoose.connection.close(); // Perform final cleanup after all tests
  });

  test("post comment route", async () => {
    let res = await req
      .post("/api/comments/post")
      .send(comment)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(201);
    expect(res.body.errors).not.toBeDefined();
    const result: CommentResource = res.body;
    expect(result.id).toBeDefined();
    expect(result.title).toBe(comment.title);
    expect(result.stars).toBe(comment.stars);
    expect(result.content).toBe(comment.content);
    expect(result.edited).toBeFalsy();
    expect(result.creator).toBe(user.id);
    expect(result.event).toBe(event.id);
    // should not work if comment creator and comment poster are not matching
    comment.creator = admin.id;
    res = await req
      .post("/api/comments/post")
      .send(comment)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test("get all comments route", async () => {
    await commentService.createComment(comment);
    let res = await req
      .get("/api/comments")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    res = await req
      .get("/api/comments")
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
    const result: CommentsResource = res.body;
    expect(result.comments).toHaveLength(1);
  });

  test("get comments of user route", async () => {
    await commentService.createComment(comment);
    let res = await req
      .get(`/api/comments/user/${user.id}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(403);
    res = await req
      .get(`/api/comments/user/${user.id}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
    const result: CommentsResource = res.body;
    expect(result.comments).toHaveLength(1);
  });

  test("get comments of event route", async () => {
    await commentService.createComment(comment);
    let res = await req.get(`/api/comments/event/${event.id}`);
    expect(res.status).toBe(200);
    res = await req
      .get(`/api/comments/event/${event.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    const result: CommentsResource = res.body;
    expect(result.comments).toHaveLength(1);
  });

  test("edit comment route", async () => {
    const oldComment = await commentService.createComment(comment);
    const c: CommentResource = {
      id: oldComment.id,
      title: "Updated Comment",
      stars: 5,
      content: "my edited comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    let res = await req
      .put(`/api/comments/${oldComment.id}`)
      .send(c)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    res = await req
      .put(`/api/comments/${oldComment.id}`)
      .send(c)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    res = await req
      .put(`/api/comments/${oldComment.id}`)
      .send(c)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
  });

  test("delete comment route", async () => {
    const c = await commentService.createComment(comment);
    let res = await req
      .delete(`/api/comments/${c.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    res = await req
      .delete(`/api/comments/${c.id}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(204);
    res = await req
      .delete(`/api/comments/${c.id}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(404);
  });
});
