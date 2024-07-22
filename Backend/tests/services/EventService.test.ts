import { connect, closeDatabase, clearDatabase } from "../../database/db";
import {
  addressEResource,
  categoryResource,
  eventResource,
  eventsResource,
  userResource,
  usersResource,
} from "../../src/Resources";
import { Event } from "../../src/model/EventModel";
import { User } from "../../src/model/UserModel";
import { EventService } from "../../src/services/EventService";

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

const u1: userResource = {
  email: "Don@joe.com",
  name: {
    first: "Don",
    last: "Joe",
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

const eventService: EventService = new EventService();
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

describe("EventService Tests", () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  test("create event", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.name).toBe(e.name);
    expect(event.creator).toBeDefined;
    expect(event.description).toBe(e.description);
    expect(event.price).toBe(e.price);
    expect(event.date).toBe(e.date);
    expect(event.address).toMatchObject(a);
    expect(event.thumbnail).toBe(e.thumbnail);
    expect(event.hashtags).toStrictEqual(e.hashtags);
    expect(event.category.map((c) => c.name)).toContain("Hobbys");
    expect(event.chat).toBeDefined();
    expect(event.participants.length).toBe(1);
    // identical event data should still work
    const event1 = await eventService.createEvent(e, user.id);
    expect(event1).toBeDefined();
    expect(event1.id).not.toBe(event.id);
    expect(event1.name).toBe(event.name);
    expect(event1.creator).toBe(event.creator);
    expect(event1.description).toBe(event.description);
    expect(event1.price).toBe(event.price);
    expect(event1.date).toBe(event.date);
    expect(event1.thumbnail).toBe(event.thumbnail);
    expect(event1.hashtags).toStrictEqual(event.hashtags);
    expect(event1.chat).not.toBe(event.chat);
    expect(event.participants.length).toBe(event.participants.length);
  });

  test("get event", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    await expect(eventService.getEvent(undefined)).rejects.toThrow();
    await expect(eventService.getEvent(NON_EXISTING_ID)).rejects.toThrow();
    const er = await eventService.getEvent(event.id);
    const em = await Event.findById(event.id);
    expect(er.id).toBe(em.id);
    expect(er.name).toBe(em.name);
    expect(er.creator).toBeDefined();
    expect(er.description).toBe(em.description);
    expect(er.price).toBe(em.price);
    expect(er.date).toStrictEqual(em.date);
    expect(er.address).toMatchObject(a);
    expect(er.thumbnail).toBe(em.thumbnail);
    expect(er.hashtags).toStrictEqual(em.hashtags);
    expect(er.category.map((c) => c.name)).toContain("Hobbys");
    expect(er.chat).toBeDefined;
    expect(er.participants.length).toBe(1);
  });

  test("get created events", async () => {
    await expect(eventService.getEvents(undefined)).rejects.toThrow();
    const user1 = await User.create(u);
    const user2 = await User.create(u1);
    await eventService.createEvent(e, user1.id);
    await eventService.createEvent(e1, user1.id);
    await eventService.createEvent(e2, user2.id);
    const events = await eventService.getEvents(user1.id);
    expect(events.events.length).toBe(2);
    expect(events.events[0].name).toBe("Sample Event");
    expect(events.events[1].name).toBe("Sample Event 1");
  });

  test("get all events", async () => {
    const user1 = await User.create(u);
    const user2 = await User.create(u1);
    await eventService.createEvent(e, user1.id);
    await eventService.createEvent(e1, user1.id);
    await eventService.createEvent(e2, user2.id);
    const events = await eventService.getAllEvents();
    expect(events.events.length).toBe(3);
    expect(events.events[0].name).toBe("Sample Event");
    expect(events.events[1].name).toBe("Sample Event 1");
    expect(events.events[2].name).toBe("Sample Event 2");
  });

  test("search events", async () => {
    const user1 = await User.create(u);
    const user2 = await User.create(u1);
    await eventService.createEvent(e, user1.id);
    await eventService.createEvent(e1, user1.id);
    await eventService.createEvent(e2, user2.id);
    let events: eventsResource;
    // search events by name
    events = await eventService.searchEvents("sample event");
    expect(events.events.length).toBe(3);
    expect(events.events[0].name).toBe("Sample Event");
    expect(events.events[1].name).toBe("Sample Event 1");
    expect(events.events[2].name).toBe("Sample Event 2");
    events = await eventService.searchEvents("Sample Event 2");
    expect(events.events.length).toBe(1);
    expect(events.events[0].name).toBe("Sample Event 2");
    events = await eventService.searchEvents("event sample");
    expect(events.events.length).toBe(0);
    events = await eventService.searchEvents("");
    expect(events.events.length).toBe(3);
    events = await eventService.searchEvents(undefined);
    expect(events.events.length).toBe(3);
    // search events by description
    events = await eventService.searchEvents("this is my");
    expect(events.events.length).toBe(2);
    expect(events.events[0].description).toBe("This is my first event");
    expect(events.events[1].description).toBe("this is my second gym party");
    events = await eventService.searchEvents("for anyone");
    expect(events.events.length).toBe(1);
    expect(events.events[0].description).toBe("for anyone interested");
    events = await eventService.searchEvents("this is my third event");
    expect(events.events.length).toBe(0);
    // search events by hashtags
    events = await eventService.searchEvents("sport");
    expect(events.events.length).toBe(1);
    expect(events.events[0].hashtags[0]).toBe("sport");
    events = await eventService.searchEvents("freizeit");
    expect(events.events.length).toBe(2);
    expect(events.events[0].hashtags[1]).toBe("freizeit");
    expect(events.events[1].hashtags[0]).toBe("freizeit");
    events = await eventService.searchEvents("sport freizeit");
    expect(events.events.length).toBe(0);
  });

  test("join event", async () => {
    const user1 = await User.create(u);
    const user2 = await User.create(u1);
    const event1 = await eventService.createEvent(e1, user1.id);
    const event2 = await eventService.createEvent(e2, user2.id);
    let result: eventResource;
    result = await eventService.getEvent(event2.id);
    expect(result.participants).toHaveLength(1);
    expect(result.participants[0]).toBe(user2.id);
    expect(await eventService.joinEvent(user1.id, event2.id)).toBeTruthy();
    result = await eventService.getEvent(event2.id);
    expect(result.participants).toHaveLength(2);
    expect(result.participants[0]).toBe(user2.id);
    expect(result.participants[1]).toBe(user1.id);
    expect(await eventService.joinEvent(user2.id, event1.id)).toBeTruthy();
    result = await eventService.getEvent(event1.id);
    expect(result.participants).toHaveLength(2);
    // invalid/no id
    const id = NON_EXISTING_ID;
    await expect(eventService.joinEvent(user1.id, id)).rejects.toThrow(
      "Event not found"
    );
    await expect(eventService.joinEvent(id, event1.id)).rejects.toThrow(
      "User not found"
    );
    result = await eventService.getEvent(event1.id);
    await expect(result.participants).toHaveLength(2);
    await expect(
      eventService.joinEvent(undefined, undefined)
    ).rejects.toThrow();
    // user already participating
    await expect(eventService.joinEvent(user1.id, event2.id)).rejects.toThrow(
      "User is already participating in the event"
    );
    await expect(eventService.joinEvent(user1.id, event1.id)).rejects.toThrow(
      "User is already participating in the event"
    );
    result = await eventService.getEvent(event2.id);
    expect(result.participants).toHaveLength(2);
    await expect(eventService.joinEvent(user2.id, event1.id)).rejects.toThrow(
      "User is already participating in the event"
    );
    await expect(eventService.joinEvent(user2.id, event2.id)).rejects.toThrow(
      "User is already participating in the event"
    );
    result = await eventService.getEvent(event1.id);
    expect(result.participants).toHaveLength(2);
  });

  test("get joined events", async () => {
    const user1 = await User.create(u);
    const user2 = await User.create(u1);
    const user3 = await User.create(u2);
    const event1 = await eventService.createEvent(e1, user1.id);
    const event2 = await eventService.createEvent(e2, user1.id);
    await eventService.joinEvent(user2.id, event1.id);
    await eventService.joinEvent(user2.id, event2.id);
    let result: eventsResource;
    result = await eventService.getJoinedEvents(user2.id);
    expect(result.events).toHaveLength(2);
    expect(result.events[0].name).toBe("Sample Event 1");
    expect(result.events[1].name).toBe("Sample Event 2");
    result = await eventService.getJoinedEvents(user3.id);
    expect(result.events).toHaveLength(0);
  });

  test("cancel event", async () => {
    const user1 = await User.create(u);
    const user2 = await User.create(u1);
    const user3 = await User.create(u2);
    const event1 = await eventService.createEvent(e1, user1.id);
    const event2 = await eventService.createEvent(e2, user2.id);
    let result: eventResource;
    await eventService.joinEvent(user1.id, event2.id);
    result = await eventService.getEvent(event2.id);
    expect(result.participants).toHaveLength(2);
    // invalid/no id
    const id = NON_EXISTING_ID;
    await expect(eventService.cancelEvent(user1.id, id)).rejects.toThrow(
      "Event not found"
    );
    await expect(eventService.cancelEvent(id, event1.id)).rejects.toThrow();
    await expect(
      eventService.cancelEvent(undefined, undefined)
    ).rejects.toThrow();
    // user not participating
    await expect(eventService.cancelEvent(user3.id, event2.id)).rejects.toThrow(
      "User is not participating in the event"
    );
    // cancel participation works correctly
    expect(await eventService.cancelEvent(user1.id, event2.id)).toBeTruthy();
    result = await eventService.getEvent(event2.id);
    expect(result.participants).toHaveLength(1);
    // cancel participation as event creator should not work
    await expect(eventService.cancelEvent(user1.id, event1.id)).rejects.toThrow(
      "Can not cancel participation as event manager"
    );
    result = await eventService.getEvent(event1.id);
    expect(result.participants).toHaveLength(1);
    expect(result.creator).toBe(user1.id);
  });

  test("get participants of event", async () => {
    const user = await User.create(u);
    const user1 = await User.create(u1);
    const user2 = await User.create(u2);
    const event = await eventService.createEvent(e, user.id);
    let participants: usersResource;
    // as event creator
    participants = await eventService.getParticipants(event.id, user.id);
    expect(participants.users).toHaveLength(1);
    expect(participants.users[0].id).toBe(user.id);
    await eventService.joinEvent(user1.id, event.id);
    await eventService.joinEvent(user2.id, event.id);
    participants = await eventService.getParticipants(event.id, user.id);
    expect(participants.users).toHaveLength(3);
    expect(participants.users[1].id).toBe(user1.id);
    expect(participants.users[2].id).toBe(user2.id);
    // not event creator but admin should work
    participants = await eventService.getParticipants(event.id, user1.id);
    expect(participants.users).toHaveLength(3);
    // invalid authorization
    await expect(
      eventService.getParticipants(event.id, user2.id)
    ).rejects.toThrow();
    // participant count decreases after cancel participation
    await eventService.cancelEvent(user1.id, event.id);
    await eventService.cancelEvent(user2.id, event.id);
    participants = await eventService.getParticipants(event.id, user.id);
    expect(participants.users).toHaveLength(1);
    expect(participants.users[0].id).toBe(user.id);
  });

  test("delete event", async () => {
    const user = await User.create(u);
    const user1 = await User.create(u1);
    const user2 = await User.create(u2);
    let event = await eventService.createEvent(e, user.id);
    expect(event).toBeDefined();
    let result: boolean;
    result = await eventService.deleteEvent(event.id, user.id);
    expect(result).toBeTruthy();
    await expect(eventService.getEvent(event.id)).rejects.toThrow();
    // invalid/no id
    const id = NON_EXISTING_ID;
    await expect(eventService.deleteEvent(id, undefined)).rejects.toThrow();
    await expect(eventService.deleteEvent(undefined, id)).rejects.toThrow();
    // not event creator but admin should work
    event = await eventService.createEvent(e, user.id);
    expect(event).toBeDefined();
    result = await eventService.deleteEvent(event.id, user1.id);
    expect(result).toBeTruthy();
    await expect(eventService.getEvent(event.id)).rejects.toThrow();
    // invalid authorization
    event = await eventService.createEvent(e, user.id);
    expect(event).toBeDefined();
    await expect(
      eventService.deleteEvent(event.id, user2.id)
    ).rejects.toThrow();
    expect(await eventService.getEvent(event.id)).toBeDefined();
  });

  test("update event", async () => {
    const user = await User.create(u);
    const user1 = await User.create(u1);
    const user2 = await User.create(u2);
    const event = await eventService.createEvent(e, user.id);
    expect(event.name).toBe("Sample Event");
    await eventService.updateEvent(event.id, e1, user.id);
    const newevent = await eventService.getEvent(event.id);
    // event updated correctly
    expect(newevent).toBeDefined();
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
    // invalid/no data/ids
    const id = NON_EXISTING_ID;
    await expect(eventService.updateEvent(id, e1, user.id)).rejects.toThrow();
    await expect(eventService.updateEvent(event.id, e1, id)).rejects.toThrow();
    await expect(
      eventService.updateEvent(event.id, undefined, user.id)
    ).rejects.toThrow();
    await expect(
      eventService.updateEvent(undefined, undefined, undefined)
    ).rejects.toThrow();
    // not event creator but admin should work
    const result = await eventService.updateEvent(event.id, e2, user1.id);
    // eventresource returned correctly
    expect(result).toBeDefined();
    expect(result.id).toBe(event.id);
    expect(result.name).toBe("Sample Event 2");
    expect(result.creator).toBe(event.creator);
    expect(result.description).toBe(e2.description);
    expect(result.price).toBe(e2.price);
    expect(result.date).toStrictEqual(e2.date);
    expect(result.address).toMatchObject(a);
    expect(result.thumbnail).toBe(event.thumbnail);
    expect(result.hashtags[0]).toBe("freizeit");
    expect(result.category.length).toBe(1);
    expect(result.chat).toBe(event.chat);
    expect(result.participants).toStrictEqual(event.participants);
    // invalid authorization
    await expect(
      eventService.updateEvent(event.id, e2, user2.id)
    ).rejects.toThrow();
  });
});
