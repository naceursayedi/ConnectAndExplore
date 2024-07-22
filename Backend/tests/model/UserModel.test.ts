import { clearDatabase, closeDatabase, connect } from "../../database/db";
import { IAddress, IUser, User } from "../../src/model/UserModel";

const a: IAddress = {
  postalCode: "12345",
  city: "Berlin",
};
let u: IUser = {
  email: "John@doe.com",
  name: {
    first: "John",
    last: "Doe",
  },
  password: "123",
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

describe("userModel test", () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  test("create User", async () => {
    const user = await User.create(u);
    expect(user.id).toBeDefined();
    expect(user.name.first).toBe(u.name.first);
    expect(user.name.last).toBe(u.name.last);
    expect(user.email).toBe(u.email);
    expect(user.password).not.toBe(u.password);
    expect(user.password).toBeDefined();
    expect(await user.isCorrectPassword("123")).toBeTruthy();
    expect(user.address).toMatchObject(a);
    expect(user.birthDate).toBe(u.birthDate);
    expect(user.gender).toBe(u.gender);
    expect(user.isActive).toBeTruthy();
    expect(user.profilePicture).toBe(u.profilePicture);
    expect(user.socialMediaUrls).toMatchObject(u.socialMediaUrls);
  });

  test("updated user password middleware", async () => {
    const user = await User.create(u);
    user.password = "456";
    user.email = "John@some-host.de";
    await user.save();
    const res = await User.findById(user.id);
    expect(res.password).not.toBe("456");
    expect(res.password).not.toBe("123");
    expect(res.password).toBeDefined();
    expect(await res.isCorrectPassword("456")).toBeTruthy();
    expect(res.email).toBe("John@some-host.de");
    expect(await User.findOne({ email: "John@doe.com" })).toBeNull();
  });

  test("rejects on duplicate email", async () => {
    await User.create(u);
    u.name.first = "Jane";
    await expect(User.create(u)).rejects.toThrow();
  });
});
