import { connect, closeDatabase, clearDatabase } from "../../database/db";
import {
  CommentResource,
  addressEResource,
  categoryResource,
  eventResource,
  userResource,
} from "../../src/Resources";
import { User } from "../../src/model/UserModel";
import { Comment } from "../../src/model/CommentModel";
import { CommentService } from "../../src/services/CommentService";
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
const commentService: CommentService = new CommentService();
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

describe("CommentService Tests", () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  test("create comment", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const c: CommentResource = {
      title: "Sample Comment",
      stars: -1,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    // stars < 1 or stars > 5 should not work
    await expect(commentService.createComment(c)).rejects.toThrow();
    c.stars = 6;
    await expect(commentService.createComment(c)).rejects.toThrow();

    c.stars = 1;
    const comment = await commentService.createComment(c);
    expect(comment.id).toBeDefined();
    expect(comment.title).toBe(c.title);
    expect(comment.stars).toBe(c.stars);
    expect(comment.content).toBe(c.content);
    expect(comment.creator).toBe(user.id);
    expect(comment.creatorName.first).toBe(user.name.first);
    expect(comment.creatorName.last).toBe(user.name.last);
    expect(comment.event).toBe(event.id);
    expect(comment.eventName).toBe(event.name);
    expect(typeof comment.createdAt).toBe("string");
    expect(comment.edited).toBeFalsy();
    // same user commenting on same event should not work
    await expect(commentService.createComment(c)).rejects.toThrow();
  });

  test("get comments of user", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const event1 = await eventService.createEvent(e1, user.id);
    const event2 = await eventService.createEvent(e2, user.id);
    const c: CommentResource = {
      title: "Sample Comment",
      stars: 1,
      content: "this is my first comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const c1: CommentResource = {
      title: "Sample Comment 1",
      stars: 1,
      content: "this is my second comment",
      edited: false,
      creator: user.id,
      event: event1.id,
    };
    const c2: CommentResource = {
      title: "Sample Comment 2",
      stars: 2,
      content: "this is my third comment",
      edited: false,
      creator: user.id,
      event: event2.id,
    };
    await commentService.createComment(c);
    await commentService.createComment(c1);
    await commentService.createComment(c2);
    const result = await commentService.getCommentsOfUser(user.id);
    expect(result.comments).toHaveLength(3);
    expect(result.comments[0].title).toBe("Sample Comment");
    expect(result.comments[1].creator).toBe(user.id);
    expect(result.comments[2].event).toBe(event2.id);
    // invalid id
    await expect(
      commentService.getCommentsOfUser(NON_EXISTING_ID)
    ).rejects.toThrow();
    // user with no comments
    const user1 = await User.create(u1);
    const empty = await commentService.getCommentsOfUser(user1.id);
    expect(empty.comments).toHaveLength(0);
  });

  test("get comments of event", async () => {
    const user = await User.create(u);
    const user1 = await User.create(u1);
    const user2 = await User.create(u2);
    const event = await eventService.createEvent(e, user.id);
    const c: CommentResource = {
      title: "Sample Comment",
      stars: 1,
      content: "this is my first comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const c1: CommentResource = {
      title: "Sample Comment 1",
      stars: 1,
      content: "this is my second comment",
      edited: false,
      creator: user1.id,
      event: event.id,
    };
    const c2: CommentResource = {
      title: "Sample Comment 2",
      stars: 2,
      content: "this is my third comment",
      edited: false,
      creator: user2.id,
      event: event.id,
    };
    await commentService.createComment(c);
    await commentService.createComment(c1);
    await commentService.createComment(c2);
    const result = await commentService.getCommentsOfEvent(event.id);
    expect(result.comments).toHaveLength(3);
    expect(result.comments[2].title).toBe("Sample Comment 2");
    expect(result.comments[1].event).toBe(event.id);
    expect(result.comments[0].creator).toBe(user.id);
    // invalid id
    await expect(
      commentService.getCommentsOfEvent(NON_EXISTING_ID)
    ).rejects.toThrow();
    // user with no comments
    const event1 = await eventService.createEvent(e1, user.id);
    const empty = await commentService.getCommentsOfEvent(event1.id);
    expect(empty.comments).toHaveLength(0);
  });

  test("get all comments", async () => {
    // no comments
    const empty = await commentService.getComments();
    expect(empty.comments).toHaveLength(0);

    const user = await User.create(u);
    const user1 = await User.create(u1);
    const user2 = await User.create(u2);
    const event = await eventService.createEvent(e, user.id);
    const event1 = await eventService.createEvent(e1, user1.id);
    const c: CommentResource = {
      title: "Sample Comment",
      stars: 1,
      content: "this is my first comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const c1: CommentResource = {
      title: "Sample Comment 1",
      stars: 1,
      content: "this is my second comment",
      edited: false,
      creator: user.id,
      event: event1.id,
    };
    const c2: CommentResource = {
      title: "Sample Comment 2",
      stars: 2,
      content: "this is my third comment",
      edited: false,
      creator: user1.id,
      event: event.id,
    };
    const c3: CommentResource = {
      title: "Sample Comment 3",
      stars: 3,
      content: "this is my fourth comment",
      edited: false,
      creator: user1.id,
      event: event1.id,
    };
    const c4: CommentResource = {
      title: "Sample Comment 4",
      stars: 4,
      content: "this is my fifth comment",
      edited: false,
      creator: user2.id,
      event: event.id,
    };
    const c5: CommentResource = {
      title: "Sample Comment 5",
      stars: 5,
      content: "this is my sixth comment",
      edited: false,
      creator: user2.id,
      event: event1.id,
    };
    await commentService.createComment(c);
    await commentService.createComment(c1);
    await commentService.createComment(c2);
    await commentService.createComment(c3);
    await commentService.createComment(c4);
    await commentService.createComment(c5);
    const result = await commentService.getComments();
    expect(result.comments).toHaveLength(6);
    expect(result.comments[0].title).toBe("Sample Comment");
    expect(result.comments[1].stars).toBe(1);
    expect(result.comments[2].content).toBe("this is my third comment");
    expect(result.comments[3].creator).toBe(user1.id);
    expect(result.comments[4].event).toBe(event.id);
    expect(typeof result.comments[5].createdAt).toBe("string");
  });

  test("edit comment", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const c: CommentResource = {
      title: "Sample Comment",
      stars: 1,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const comment = await commentService.createComment(c);
    expect(comment.id).toBeDefined();
    expect(comment.title).toBe(c.title);
    expect(comment.stars).toBe(1);
    expect(comment.edited).toBeFalsy();

    const c1: CommentResource = {
      id: comment.id,
      title: "Updated Comment",
      stars: 5,
      content: "my edited comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const comment1 = await commentService.updateComment(c1);
    expect(comment1.id).toBe(comment.id);
    expect(comment1.title).toBe(c1.title);
    expect(comment1.stars).toBe(5);
    expect(comment1.edited).toBeTruthy();

    // updating createdAt, creator, event should not work
    const user1 = await User.create(u1);
    const event1 = await eventService.createEvent(e1, user1.id);
    const c2: CommentResource = {
      id: comment.id,
      title: "New Comment",
      stars: 4,
      content: "my new comment",
      edited: true,
      creator: user1.id,
      event: event1.id,
      createdAt: "01.01.2001",
    };
    const comment2 = await commentService.updateComment(c2);
    expect(comment2.createdAt).not.toBe(c2.createdAt);
    expect(comment2.createdAt).toBe(comment.createdAt);
    expect(comment2.creator).not.toBe(c2.creator);
    expect(comment2.creator).toBe(c.creator);
    expect(comment2.event).not.toBe(c2.event);
    expect(comment2.event).toBe(c.event);
  });

  test("delete one comment", async () => {
    const user = await User.create(u);
    const event = await eventService.createEvent(e, user.id);
    const c: CommentResource = {
      title: "Sample Comment",
      stars: 1,
      content: "this is my comment",
      edited: false,
      creator: user.id,
      event: event.id,
    };
    const comment = await commentService.createComment(c);
    expect(await Comment.findById(comment.id)).not.toBeNull();

    await commentService.deleteComment(comment.id);
    expect(await Comment.findById(comment.id)).toBeNull();

    // invalid id
    await expect(
      commentService.deleteComment(NON_EXISTING_ID)
    ).rejects.toThrow();
  });
});
