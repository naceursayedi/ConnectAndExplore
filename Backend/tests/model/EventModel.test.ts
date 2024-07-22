import { Types } from "mongoose";
import { Event, ICategory, IEvent } from "../../src/model/EventModel";
import { clearDatabase, closeDatabase, connect } from "../../database/db";
import { IEAddress } from "../../src/model/EventModel";

const a: IEAddress = {
  street: "Street",
  houseNumber: "1",
  postalCode: "12345",
  city: "Berlin",
  country: "Germany",
};

const c: ICategory = {
  name: "Hobbys",
  description: "persönliche Interessen, Freizeit",
};

describe("Event Model Tests", () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  test("create event", async () => {
    const eventData: IEvent = {
      name: "Test Event",
      creator: new Types.ObjectId(),
      description: "A test event",
      price: 10,
      date: new Date(),
      address: a,
      category: [c],
      chat: new Types.ObjectId(),
      participants: [],
    };
    const createdEvent = await Event.create(eventData);
    expect(createdEvent).toBeDefined();
    expect(createdEvent.name).toBe(eventData.name);
    expect(createdEvent.creator).toBe(eventData.creator);
    expect(createdEvent.description).toBe(eventData.description);
    expect(createdEvent.price).toBe(eventData.price);
    expect(createdEvent.date).toBe(eventData.date);
    expect(createdEvent.address).toMatchObject(a);
    expect(createdEvent.category.map((c) => c.name)).toContain("Hobbys");
    expect(createdEvent.chat).toBe(eventData.chat);
    expect(createdEvent.participants).toStrictEqual(eventData.participants);
  });

  test("empty eventdata", async () => {
    const eventData: IEvent = {
      name: "",
      creator: new Types.ObjectId(),
      description: "",
      price: 0,
      date: undefined,
      address: undefined,
      category: [],
      chat: new Types.ObjectId(),
      participants: [],
    };
    await expect(Event.create(eventData)).rejects.toThrow();
  });

  test("negative price", async () => {
    const eventData: IEvent = {
      name: "Test Event",
      creator: new Types.ObjectId(),
      description: "A test event",
      price: -1,
      date: new Date(),
      address: a,
      category: [c],
      chat: new Types.ObjectId(),
      participants: [],
    };
    await expect(Event.create(eventData)).rejects.toThrow();
  });
});
