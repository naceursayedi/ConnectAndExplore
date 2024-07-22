import request from "supertest";
import { connect, clearDatabase } from "../../database/db";
import {
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
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";
let admin: userResource;
let AdminToken: string;
let jane: userResource;
let token: string;
let user: userResource;
let uToken: string;
let req = request(app);

describe("EventRoute Tests", () => {
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
  });
  afterEach(async () => await clearDatabase());
  afterAll(async () => {
    //closeServer(); // Close the server after all tests
    await mongoose.connection.close(); // Perform final cleanup after all tests
  });

  test("create event route", async () => {
    let res = await req
      .post("/api/events/create")
      .send(e)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body.errors).not.toBeDefined();
    const event: eventResource = res.body;
    expect(event.id).toBeDefined();
    expect(event.name).toBe("Sample Event");
    expect(event.creator).toBe(jane.id);
    expect(event.description).toBe(e.description);
    expect(event.price).toBe(e.price);
    expect(event.date).toBe(e.date.toISOString());
    expect(event.address).toMatchObject(a);
    expect(event.thumbnail).toBe(e.thumbnail);
    expect(event.hashtags).toStrictEqual(e.hashtags);
    expect(event.category).toHaveLength(2);
    expect(event.chat).toBeDefined();
    expect(event.participants).toHaveLength(1);
    // create event as admin
    res = await req
      .post("/api/events/create")
      .send(e)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(201);
    expect(res.body.errors).not.toBeDefined();
    // duplicate event data should still work
    const event1: eventResource = res.body;
    expect(event1).toBeDefined();
    expect(event1.id).not.toBe(event.id);
    expect(event1.name).toBe(event.name);
    expect(event1.creator).toBe(admin.id);
    expect(event1.description).toBe(event.description);
    expect(event1.price).toBe(event.price);
    expect(event1.date).toBe(event.date);
    expect(event1.thumbnail).toBe(event.thumbnail);
    expect(event1.hashtags).toStrictEqual(event.hashtags);
    expect(event1.chat).not.toBe(event.chat);
    expect(event.participants.length).toBe(event.participants.length);
    // invalid token/event data
    res = await req
      .post("/api/events/create")
      .send(undefined)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    res = await req
      .post("/api/events/create")
      .send(e)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
  });

  test("get event route", async () => {
    const event = await eventService.createEvent(e, jane.id);
    // get event as event creator
    let res = await req
      .get(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Sample Event");
    // get event as user
    res = await req
      .get(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Sample Event");
    // invalid id/token
    res = await req
      .get(`/api/events/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(404);
    res = await req
      .get(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
  });

  test("join event route", async () => {
    const event = await eventService.createEvent(e, jane.id);
    // join event as user
    let res = await req
      .post(`/api/events/${event.id}/join`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User joined the event successfully");
    const ee = await eventService.getEvent(event.id);
    expect(ee.participants).toHaveLength(2);
    // user already participating
    res = await req
      .post(`/api/events/${event.id}/join`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(409);
    // join event as event creator should not work
    res = await req
      .post(`/api/events/${event.id}/join`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(409);
    // invalid id/token
    res = await req
      .post(`/api/events/${undefined}/join`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(500);
    res = await req
      .post(`/api/events/${event.id}/join`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
  });

  test("cancel event participation route", async () => {
    let event = await eventService.createEvent(e, jane.id);
    // invalid id/token
    let res = await req
      .delete(`/api/events/${undefined}/cancel`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(500);
    res = await req
      .delete(`/api/events/${event.id}/cancel`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
    // user not participating
    res = await req
      .delete(`/api/events/${event.id}/cancel`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(409);
    // cancel participation works correctly
    await eventService.joinEvent(user.id, event.id);
    res = await req
      .delete(`/api/events/${event.id}/cancel`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(204);
    // cancel participation as event creator should not work
    res = await req
      .delete(`/api/events/${event.id}/cancel`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(409);
  });

  test("get participants of event route", async () => {
    let event = await eventService.createEvent(e, jane.id);
    await eventService.joinEvent(user.id, event.id);
    // get participants as event creator
    let res = await req
      .get(`/api/events/${event.id}/participants`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0].email).toBe("Jane@doe.com");
    expect(res.body.users[1].email).toBe("test@mail.com");
    // not event creator but admin should work
    res = await req
      .get(`/api/events/${event.id}/participants`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    // get participants as user should not work
    res = await req
      .get(`/api/events/${event.id}/participants`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(404);
    // invalid id/token
    res = await req
      .get(`/api/events/${undefined}/participants`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(404);
    res = await req
      .get(`/api/events/${event.id}/participants`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
  });

  test("get created events route", async () => {
    await eventService.createEvent(e, jane.id);
    await eventService.createEvent(e1, jane.id);
    await eventService.createEvent(e2, jane.id);
    // get created events as event creator
    let res = await req
      .get(`/api/events/creator/${jane.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
    expect(res.body.events[0].name).toBe("Sample Event");
    expect(res.body.events[1].name).toBe("Sample Event 1");
    expect(res.body.events[2].name).toBe("Sample Event 2");
    // get created events of user with no events
    res = await req
      .get(`/api/events/creator/${user.id}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(204);
    // not event creator but admin should work
    res = await req
      .get(`/api/events/creator/${jane.id}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
    // get created events as user shoud not work
    res = await req
      .get(`/api/events/creator/${jane.id}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(403);
    // invalid id/token
    res = await req
      .get(`/api/events/creator/${undefined}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(404);
    res = await req
      .get(`/api/events/creator/${jane.id}`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
  });

  test("get joined events route", async () => {
    const event = await eventService.createEvent(e, jane.id);
    const event1 = await eventService.createEvent(e1, jane.id);
    const event2 = await eventService.createEvent(e2, jane.id);
    await eventService.joinEvent(user.id, event.id);
    await eventService.joinEvent(user.id, event1.id);
    await eventService.joinEvent(user.id, event2.id);
    // 3 events created no events joined
    let res = await req
      .get(`/api/events/joined`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
    // no events created 3 events joined
    res = await req
      .get(`/api/events/joined`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
    // no events created no events joined
    res = await req
      .get(`/api/events/joined`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(204);
    expect(res.body.events).toBeUndefined();
    // invalid token
    res = await req
      .get(`/api/events/joined`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
  });

  test("get all events route", async () => {
    // get all events as registered user
    let res = await req
      .get(`/api/events/`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
    // get all events as guest user
    res = await req.get(`/api/events/`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
  });

  test("search events route", async () => {
    await eventService.createEvent(e, jane.id);
    await eventService.createEvent(e1, user.id);
    await eventService.createEvent(e2, admin.id);
    // search by event name
    let res = await req
      .get("/api/events/search")
      .query({ query: "sAmPle eVeNt" })
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
    res = await req
      .get("/api/events/search")
      .query({ query: "event 2" })
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    res = await req.get("/api/events/search").query({ query: "EVENT SAMPLE" });
    expect(res.status).toBe(204);
    expect(res.body.events).toBeUndefined();
    // search by description
    res = await req
      .get("/api/events/search")
      .query({ query: "this is my" })
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(2);
    // search by hashtags
    res = await req.get("/api/events/search").query({ query: "SPORT" });
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    res = await req.get("/api/events/search").query({ query: "freizeit" });
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(2);
    res = await req
      .get("/api/events/search")
      .query({ query: "Sport Freizeit" });
    expect(res.status).toBe(204);
    expect(res.body.events).toBeUndefined();
  });

  test("delete event route", async () => {
    const event = await eventService.createEvent(e, jane.id);
    const event1 = await eventService.createEvent(e1, user.id);
    // user can not delete event of another event creator
    let res = await req
      .delete(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(404);
    expect(await eventService.getEvent(event.id)).toBeDefined();
    // event creator can delete own event correctly
    res = await req
      .delete(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
    await expect(eventService.getEvent(event.id)).rejects.toThrow();
    // invalid id/token
    res = await req
      .delete(`/api/events/${undefined}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(await eventService.getEvent(event1.id)).toBeDefined();
    res = await req
      .delete(`/api/events/${event1.id}`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
    expect(await eventService.getEvent(event1.id)).toBeDefined();
    // not event creator but admin should work
    res = await req
      .delete(`/api/events/${event1.id}`)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(204);
    await expect(eventService.getEvent(event.id)).rejects.toThrow();
  });

  test("update event route", async () => {
    const event = await eventService.createEvent(e, jane.id);
    // user can not update event of another event creator
    let res = await req
      .put(`/api/events/${event.id}`)
      .send(e1)
      .set("Authorization", `Bearer ${uToken}`);
    expect(res.status).toBe(404);
    // no updated event data sent should still work
    res = await req
      .put(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(event.name);
    // invalid id/token
    res = await req
      .put(`/api/events/${undefined}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    res = await req
      .put(`/api/events/${event.id}`)
      .set("Authorization", `Bearer ${undefined}`);
    expect(res.status).toBe(401);
    // event creator should update event correctly
    res = await req
      .put(`/api/events/${event.id}`)
      .send(e1)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    // eventresource returned correctly
    expect(res.body.id).toBe(event.id);
    expect(res.body.name).toBe(e1.name);
    expect(res.body.creator).toBe(event.creator);
    expect(res.body.description).toBe(e1.description);
    expect(res.body.price).toBe(e1.price);
    expect(res.body.date).toStrictEqual(e1.date.toISOString());
    expect(res.body.address).toMatchObject(a);
    expect(res.body.thumbnail).toBe(event.thumbnail);
    expect(res.body.hashtags).toStrictEqual(event.hashtags);
    expect(res.body.category.length).toBe(1);
    expect(res.body.chat).toBe(event.chat);
    expect(res.body.participants).toStrictEqual(event.participants);
    // not event creator but admin should work
    res = await req
      .put(`/api/events/${event.id}`)
      .send(e1)
      .set("Authorization", `Bearer ${AdminToken}`);
    expect(res.status).toBe(200);
    const newevent = await eventService.getEvent(event.id);
    expect(newevent.id).toBe(event.id);
    expect(newevent.name).toBe("Sample Event 1");
    expect(newevent.creator).toBe(event.creator);
    expect(newevent.description).toBe(e1.description);
    expect(newevent.price).toBe(e1.price);
    expect(newevent.date).toStrictEqual(e1.date);
    expect(newevent.address).toMatchObject(a);
    expect(newevent.thumbnail).toBe(event.thumbnail);
    expect(newevent.hashtags).toStrictEqual(event.hashtags);
    expect(newevent.category.length).toBe(1);
    expect(newevent.chat).toBe(event.chat);
    expect(newevent.participants).toStrictEqual(event.participants);
  });
});
