import { clearDatabase, closeDatabase, connect } from "../../database/db";
import { userResource } from "../../src/Resources";
import { IAddress, User } from "../../src/model/UserModel";
import { UserService } from "../../src/services/UserService";

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
  profilePicture: "picture1",
  socialMediaUrls: {
    facebook: "facebook",
    instagram: "instagram",
  },
};

const userService: UserService = new UserService();
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";
describe("UserService test", () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  test("createUser function", async () => {
    const user = await userService.createUser(u);
    expect(user.id).toBeDefined();
    expect(user.name.first).toBe(u.name.first);
    expect(user.name.last).toBe(u.name.last);
    expect(user.email).toBe(u.email);
    expect(user.password).toBeUndefined();
    const res = await User.findById(user.id);
    expect(await res.isCorrectPassword("12abcAB!")).toBeTruthy();
    expect(user.address).toMatchObject(a);
    expect(user.birthDate).toBe(u.birthDate);
    expect(user.gender).toBe(u.gender);
    expect(user.isActive).toBeTruthy();
    expect(user.profilePicture).toBe(u.profilePicture);
    expect(user.socialMediaUrls).toMatchObject(u.socialMediaUrls);
  });

  test("getUser works and returns user without password", async () => {
    const user = await userService.createUser(u);
    await expect(userService.getUser(undefined)).rejects.toThrow(
      "Can not get user, userID is invalid"
    );
    await expect(userService.getUser(NON_EXISTING_ID)).rejects.toThrow(
      `No user with id: ${NON_EXISTING_ID} exists.`
    );
    const res: userResource = await userService.getUser(user.id);
    expect(user.id).toBeDefined();
    expect(user.name.first).toBe(u.name.first);
    expect(user.name.last).toBe(u.name.last);
    expect(user.email).toBe(u.email);
    expect(user.password).toBeUndefined();
    const r = await User.findById(user.id);
    expect(await r.isCorrectPassword("12abcAB!")).toBeTruthy();
    expect(user.address).toMatchObject(a);
    expect(user.birthDate).toBe(u.birthDate);
    expect(user.gender).toBe(u.gender);
    expect(user.isActive).toBeTruthy();
    expect(user.profilePicture).toBe(u.profilePicture);
    expect(user.socialMediaUrls).toMatchObject(u.socialMediaUrls);
  });

  test("get all users also returns inactive users, getUser(userID) throws error at inactive user.", async () => {
    const u1 = await userService.createUser(u);
    const user1: userResource = {
      id: u1.id,
      email: u1.email,
      name: {
        first: u1.name.first,
        last: u1.name.last,
      },
      isAdministrator: u1.isAdministrator,
      address: u1.address,
      birthDate: u1.birthDate,
      gender: u1.gender,
      isActive: u1.isActive,
    };
    u.isActive = false;
    u.email = "Jane@doe.com";
    u.name.first = "Jane";
    const u2 = await User.create(u);
    const user2: userResource = {
      id: u2.id,
      email: u2.email,
      name: {
        first: u2.name.first,
        last: u2.name.last,
      },
      isAdministrator: u2.isAdministrator,
      address: u2.address,
      birthDate: u2.birthDate,
      gender: u2.gender,
      isActive: u2.isActive,
    };
    await expect(userService.getUser(u2.id)).rejects.toThrow(
      `No user with id: ${u2.id} exists.`
    );
    const users = await userService.getUsers();
    expect(users.users.length).toBe(2);
    expect(users.users[0].isActive).toBe(user1.isActive);
    expect(users.users[1].isActive).toBe(user2.isActive);
  });

  test("updateUserWithAdmin user update validations", async () => {
    const user = await userService.createUser(u);
    const existingUserId = user.id;
    const updatedUser = {
      ...u,
      id: existingUserId,
      email: "newemail@example.com",
    };
    const result = await userService.updateUserWithAdmin(updatedUser);
    expect(result.id).toBeDefined();
    expect(result.name.first).toBe(updatedUser.name.first);
    expect(result.name.last).toBe(updatedUser.name.last);
    expect(result.email).toBe(updatedUser.email);
    expect(result.password).toBeUndefined();
    expect(result.address).toMatchObject(updatedUser.address);
    expect(result.birthDate).toBe(updatedUser.birthDate);
    expect(result.gender).toBe(updatedUser.gender);
    expect(result.isActive).toBeTruthy();
    expect(result.profilePicture).toBe(updatedUser.profilePicture);
    expect(result.socialMediaUrls).toMatchObject(updatedUser.socialMediaUrls);

    //Test for missing userID
    const userWithNoId = { ...u, id: undefined };
    await expect(userService.updateUserWithAdmin(userWithNoId)).rejects.toThrow(
      "User id is missing, cannot update User."
    );

    //Test for non-existing userID
    const nonExistingUser = { ...u, id: NON_EXISTING_ID };
    await expect(
      userService.updateUserWithAdmin(nonExistingUser)
    ).rejects.toThrow(
      `No user with id: ${NON_EXISTING_ID} found, cannot update`
    );
  });

  test("updateUserWithAdmin duplicate email check", async () => {
    const user = await userService.createUser(u);
    await userService.createUser({ ...u, email: "duplicate@example.com" });
    //Create another user with a different ID but same email for duplicate check
    const userWithDuplicateEmail = { ...user, email: "duplicate@example.com" };
    await expect(
      userService.updateUserWithAdmin(userWithDuplicateEmail)
    ).rejects.toThrow("Duplicate email");
  });

  test("updateUserWithPw update with old password to update password", async () => {
    const oldPw: string = u.password;
    const user: userResource = await userService.createUser(u);

    user.name.first = "Jane";
    user.password = "newPassword123!";
    const updatedUser: userResource = await userService.updateUserWithPw(
      user,
      oldPw
    );
    expect(updatedUser.name.first).toBe("Jane");
    const Jane = await User.findById(user.id).exec();
    expect(Jane.password).toBeDefined();
    expect(await Jane.isCorrectPassword("newPassword123!")).toBeTruthy();

    //Test if user does not update Password on wrong old password.
    await expect(
      userService.updateUserWithPw(user, "wrongPassword")
    ).rejects.toThrow("invalid oldPassword, can not update User!");
  });

  test("updateUserWithPw throws errors on invalid userdata", async () => {
    const user: userResource = await userService.createUser(u);
    user.id = undefined;
    user.name.first = "Jane";
    await expect(userService.updateUserWithPw(user)).rejects.toThrow(
      "User id is missing, cannot update User."
    );
    user.id = NON_EXISTING_ID;
    await expect(userService.updateUserWithPw(user)).rejects.toThrow(
      `No user with id: ${NON_EXISTING_ID} found, cannot update`
    );
  });

  test("updateUserWithPw duplicate email check", async () => {
    const user = await userService.createUser(u);
    await userService.createUser({ ...u, email: "duplicate@example.com" });
    //Create another user with a different ID but same email for duplicate check
    const userWithDuplicateEmail = { ...user, email: "duplicate@example.com" };
    await expect(
      userService.updateUserWithPw(userWithDuplicateEmail)
    ).rejects.toThrow("Duplicate email");
  });

  test("updateUserWithPw can not change isActive status of user", async () => {
    const user = await userService.createUser(u);
    user.isActive = false;
    user.name.first = "Jane";
    const res = await userService.updateUserWithPw(user);
    expect(res.isActive).toBeTruthy();
    expect(res.name.first).toBe("Jane");
  });

  test("deleteUser deletes user from database (when performed by an admin)", async () => {
    const user = await userService.createUser(u);
    const res = await userService.deleteUser(user.id, false);
    expect(res).toBeTruthy();
    const noUserFound = await User.findById(user.id);
    expect(noUserFound).toBeNull();

    await expect(
      userService.deleteUser(NON_EXISTING_ID, false)
    ).rejects.toThrow(
      "User not found, probably invalid userID or user is already deleted"
    );
    await expect(userService.deleteUser("", false)).rejects.toThrow(
      "invalid userID, can not delete/inactivate account"
    );
  });

  test("deleteUser inactivates acc when inactivateAccount = true", async () => {
    const user = await userService.createUser(u);
    const res = await userService.deleteUser(user.id, true);
    expect(res).toBeTruthy();
    const inactiveUser = await User.findById(user.id);
    expect(inactiveUser.isActive).toBeFalsy();
  });
});
