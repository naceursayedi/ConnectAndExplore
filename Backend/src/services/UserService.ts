import { User } from "../model/UserModel";
import {
  usersResource,
  userResource,
  usersResourceNA,
  userResourceNA,
} from "../Resources";
import { CommentService } from "../../src/services/CommentService";

const commentService: CommentService = new CommentService();

export class UserService {
  async registerUser(user: any) {
    if (!user || typeof user !== "object") {
      throw new Error("Invalid user data");
    }
    // Check if the user already exists in the database
    const { email } = user;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }
    // Create a new user
    try {
      const newUser = await User.create(user);
      return newUser;
    } catch (error) {
      throw new Error("Registration failed");
    }
  }

  async getUsers(): Promise<usersResource> {
    const users = await User.find({}).exec();
    const usersResource: usersResource = {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdministrator: user.isAdministrator,
        address: user.address,
        profilePicture: user.profilePicture,
        birthDate: user.birthDate,
        gender: user.gender,
        socialMediaUrls: user.socialMediaUrls,
        isActive: user.isActive,
      })),
    };
    return usersResource;
  }
  async getUsersNotAdmin(): Promise<usersResourceNA> {
    const users = await User.find({}).exec();
    const usersResource: usersResourceNA = {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
      })),
    };
    return usersResource;
  }

  async getUser(userID: string): Promise<userResource> {
    if (!userID) {
      throw new Error("Can not get user, userID is invalid");
    }
    const user = await User.findOne({ _id: userID, isActive: true }).exec();
    if (!user) {
      throw new Error(`No user with id: ${userID} exists.`);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdministrator: user.isAdministrator,
      address: user.address,
      profilePicture: user.profilePicture,
      birthDate: user.birthDate,
      gender: user.gender,
      socialMediaUrls: user.socialMediaUrls,
      isActive: user.isActive,
    };
  }
  async getUserInfo(userID: string): Promise<userResourceNA> {
    if (!userID) {
      throw new Error("Can not get user, userID is invalid");
    }
    const user = await User.findOne({ _id: userID }).exec();
    if (!user) {
      throw new Error(`No user with id: ${userID} exists.`);
    }
    return {
      id: user.id,
      name: user.name,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
    };
  }
  /**
   * used to prefill db with standard admin user. Therefore this servicemethod does not need an endpoint.
   * @param userResource
   * @returns userResource
   */
  async createUser(userResource: userResource): Promise<userResource> {
    const user = await User.create({
      name: userResource.name,
      email: userResource.email,
      isAdministrator: userResource.isAdministrator,
      address: userResource.address,
      password: userResource.password,
      profilePicture: userResource.profilePicture,
      birthDate: userResource.birthDate,
      gender: userResource.gender,
      socialMediaUrls: userResource.socialMediaUrls,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdministrator: user.isAdministrator,
      address: user.address,
      profilePicture: user.profilePicture,
      birthDate: user.birthDate,
      gender: user.gender,
      socialMediaUrls: user.socialMediaUrls,
      isActive: user.isActive,
    };
  }

  /**
   * Admin function to update userdata. can update password & isAdministrator.
   * @param userResource
   * @returns userResource of updated user.
   */
  async updateUserWithAdmin(userResource: userResource): Promise<userResource> {
    if (!userResource.id) {
      throw new Error("User id is missing, cannot update User.");
    }

    const user = await User.findById(userResource.id).exec();
    if (!user) {
      throw new Error(
        `No user with id: ${userResource.id} found, cannot update`
      );
    }

    for (const property in userResource) {
      if (userResource.hasOwnProperty(property)) {
        if (property === "oldPassword") {
          continue;
        }

        if (property === "name") {
          user.name.first = userResource.name.first;
          user.name.last = userResource.name.last;
        } else {
          user[property] = userResource[property];
        }
        if (property === "address") {
          user.address.postalCode = userResource.address.postalCode;
          user.address.city = userResource.address.city;
        } else {
          user[property] = userResource[property];
        }
      }
    }

    const savedUser = await user.save();
    return savedUser;
  }

  async updateUserWithPw(
    userResource: userResource,
    oldPw?: string
  ): Promise<userResource> {
    if (!userResource.id) {
      throw new Error("User id is missing, cannot update User.");
    }

    const user = await User.findById(userResource.id).exec();
    if (!user) {
      throw new Error(
        `No user with id: ${userResource.id} found, cannot update`
      );
    }
    if (oldPw) {
      const res = await user.isCorrectPassword(oldPw);
      if (!res) {
        throw new Error("Invalid oldPassword, cannot update User!");
      }
    }
    for (const property in userResource) {
      if (property === "oldPassword") continue;
      if (property === "Password") {
        user.password = userResource[property];
      } else {
        if (property === "deletePicture") {
          user.profilePicture = "";
        } else user[property] = userResource[property];
      }
    }

    const savedUser = await user.save();
    return savedUser;
  }

  /**
   * This function is used to either disable a user account or to delete the account from the database.
   * If the logged-in user is an admin (role in req.role === "a") and performs the "delete" endpoint request,
   * inactivateAccount is set to false, and the user is deleted from the database.
   * Otherwise, the user himself deactivates his account, and inactivateAccount is set to true.
   * @param userID The ID of the user to be deactivated or deleted.
   * @param inactivateAccount If true, user.isActive is set to false and the user object remains in the database; otherwise, the admin deletes the user from the database.
   * @returns true if the user was deleted or inactivated, false if no user was deleted.
   */
  async deleteUser(
    userID: string,
    inactivateAccount: boolean
  ): Promise<boolean> {
    if (!userID) {
      throw new Error("invalid userID, can not delete/inactivate account");
    }
    const u = await User.findOne({ _id: userID }).exec();
    if (!u) {
      throw new Error(
        "User not found, probably invalid userID or user is already deleted"
      );
    }
    if (inactivateAccount) {
      u.isActive = false;
      const user = await u.save();
      return !user.isActive;
    } else {
      const res = await User.deleteOne({ _id: userID });
      if (res.deletedCount === 1) {
        await commentService.deleteCommentsOfUser(userID);
        return true;
      } else {
        return false;
      }
    }
  }
}

export default new UserService();
