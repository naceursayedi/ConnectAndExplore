import { connect, closeDatabase, clearDatabase } from "../../database/db";
import {
  CommentResource,
  RatingResource,
  addressEResource,
  categoryResource,
  eventResource,
  userResource,
} from "../../src/Resources";
import { User } from "../../src/model/UserModel";
import { CommentService } from "../../src/services/CommentService";
import { EventService } from "../../src/services/EventService";
import { Rating, RatingType } from "../../src/model/RatingModel";
import { RatingService } from "../../src/services/RatingService";

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

const eventService: EventService = new EventService();
const commentService: CommentService = new CommentService();
const ratingService: RatingService = new RatingService();

describe("RatingService Tests", () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  test("rate a comment", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const cr: CommentResource = {
      title: "Sample Comment",
      stars: 5,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const user1 = await User.create(u1);
    const comment = await commentService.createComment(cr);
    const r: RatingResource = {
      comment: comment.id,
      creator: user1.id,
      ratingType: RatingType.Helpful,
    };
    const rating = await ratingService.createRating(r);
    expect(rating.id).toBeDefined();
    expect(rating.comment).toBe(comment.id);
    expect(rating.creator).toBe(user1.id);
    expect(rating.ratingType).toBe("helpful");
    // same user rating same comment should not work
    await expect(ratingService.createRating(r)).rejects.toThrow();
    // user rating own comment should not work
    r.creator = user.id;
    await expect(ratingService.createRating(r)).rejects.toThrow();
  });

  test("get ratings of comment", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const cr: CommentResource = {
      title: "Sample Comment",
      stars: 5,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const user1 = await User.create(u1);
    const user2 = await User.create(u2);
    const comment = await commentService.createComment(cr);
    const r: RatingResource = {
      comment: comment.id,
      creator: user1.id,
      ratingType: RatingType.Helpful,
    };
    await ratingService.createRating(r);
    r.creator = user2.id;
    r.ratingType = RatingType.Reported;
    await ratingService.createRating(r);
    const result = await ratingService.getRatingsOfComment(comment.id);
    expect(result.ratings).toHaveLength(2);
    expect(result.ratings[0].ratingType).toBe("helpful");
    expect(result.ratings[1].ratingType).toBe("reported");
  });

  test("update rating", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const cr: CommentResource = {
      title: "Sample Comment",
      stars: 5,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const user1 = await User.create(u1);
    const comment = await commentService.createComment(cr);
    const cr1: CommentResource = {
      title: "Sample Comment 1",
      stars: 1,
      content: "this is my other comment",
      edited: false,
      creator: user1.id,
      event: event.id,
    };
    const user2 = await User.create(u2);
    const comment1 = await commentService.createComment(cr1);
    const r: RatingResource = {
      comment: comment.id,
      creator: user1.id,
      ratingType: RatingType.Helpful,
    };
    const rating = await ratingService.createRating(r);
    r.id = rating.id;
    r.ratingType = RatingType.Reported;
    const rating1 = await ratingService.updateRating(r);
    expect(rating1.id).toBe(rating.id);
    expect(rating1.comment).toBe(rating.comment);
    expect(rating1.creator).toBe(rating.creator);
    expect(rating1.ratingType).toBe("reported");
    // updating creatorId or commentId should not work
    r.creator = user2.id;
    await expect(ratingService.updateRating(r)).rejects.toThrow();
    r.comment = comment1.id;
    await expect(ratingService.updateRating(r)).rejects.toThrow();
  });

  test("delete rating", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const cr: CommentResource = {
      title: "Sample Comment",
      stars: 5,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const user1 = await User.create(u1);
    const comment = await commentService.createComment(cr);
    const r: RatingResource = {
      comment: comment.id,
      creator: user1.id,
      ratingType: RatingType.Helpful,
    };
    const rating = await ratingService.createRating(r);
    expect(await Rating.findById(rating.id)).not.toBeNull();
    await ratingService.deleteRating(rating.id);
    expect(await Rating.findById(rating.id)).toBeNull();
    await expect(ratingService.deleteRating(rating.id)).rejects.toThrow();
  });
});
