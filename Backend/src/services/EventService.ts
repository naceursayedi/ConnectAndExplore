import { Types } from "mongoose";
import { eventResource, eventsResource, usersResource } from "../Resources";
import { Chat, Event } from "../model/EventModel";
import { User } from "../model/UserModel";
import { CommentService } from "../../src/services/CommentService";

const commentService: CommentService = new CommentService();

export class EventService {
  /**
   * Event erstellen
   */
  async createEvent(
    eventResource: eventResource,
    creatorID: string
  ): Promise<eventResource> {
    try {
      const creator = await User.findById(creatorID);
      const chat = await Chat.create({ messages: [] });
      const event = await Event.create({
        name: eventResource.name,
        creator: creator.id,
        description: eventResource.description,
        price: eventResource.price,
        date: eventResource.date,
        address: eventResource.address,
        thumbnail: eventResource.thumbnail,
        hashtags: eventResource.hashtags,
        category: eventResource.category,
        chat: chat.id,
        participants: [creatorID],
      });

      chat.event = event._id;
      await chat.save();

      return {
        id: event.id,
        name: event.name,
        creator: event.creator.toString(),
        creatorName: creator.name,
        description: event.description,
        price: event.price,
        date: event.date,
        address: event.address,
        thumbnail: event.thumbnail,
        hashtags: event.hashtags,
        category: event.category,
        chat: event.chat.toString(),
        participants: event.participants.map((participantId) =>
          participantId.toString()
        ),
      };
    } catch (err) {
      throw new Error("Event creation failed");
    }
  }

  /**
   * Ein bestimmtes Event abrufen
   */
  async getEvent(eventID: string): Promise<eventResource> {
    try {
      const event = await Event.findById(eventID).exec();
      if (!event) {
        throw new Error("Event not found");
      }
      const creator = await User.findById(event.creator).exec();
      if (!creator) {
        throw new Error("Creator of Event does not exist.");
      }
      return {
        id: event.id,
        name: event.name,
        creator: event.creator.toString(),
        creatorName: creator.name,
        description: event.description,
        price: event.price,
        date: event.date,
        address: event.address,
        thumbnail: event.thumbnail,
        hashtags: event.hashtags,
        category: event.category,
        chat: event.chat.toString(),
        participants: event.participants.map((participantId) =>
          participantId.toString()
        ),
      };
    } catch (error) {
      throw new Error("Error getting event");
    }
  }

  /**
   * Alle erstellten Events abrufen ( Event Manager / Admin )
   */
  async getEvents(userID: string): Promise<eventsResource> {
    if (!userID) {
      throw new Error("Can not get creator, userID is invalid");
    }
    try {
      const events = await Event.find({ creator: userID }).exec();
      const eventsResult: eventsResource = {
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          creator: event.creator.toString(),
          description: event.description,
          price: event.price,
          date: event.date,
          address: event.address,
          thumbnail: event.thumbnail,
          hashtags: event.hashtags,
          category: event.category,
          chat: event.chat.toString(),
          participants: event.participants.map((participantId) =>
            participantId.toString()
          ),
        })),
      };
      return eventsResult;
    } catch (error) {
      throw new Error("Error getting events");
    }
  }

  /**
   * Alle Events abrufen
   */
  async getAllEvents(): Promise<eventsResource> {
    try {
      const events = await Event.find({}).exec();
      const eventsResult: eventsResource = {
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          creator: event.creator.toString(),
          description: event.description,
          price: event.price,
          date: event.date,
          address: event.address,
          thumbnail: event.thumbnail,
          hashtags: event.hashtags,
          category: event.category,
          chat: event.chat.toString(),
          participants: event.participants.map((participantId) =>
            participantId.toString()
          ),
        })),
      };
      return eventsResult;
    } catch (error) {
      throw new Error("Error getting events");
    }
  }

  /**
   * Events filtern / Event suchen
   */
  async searchEvents(query: string): Promise<eventsResource> {
    if (!query || query.trim().length === 0) return this.getAllEvents();
    try {
      const events = await Event.find({
        $or: [
          { name: { $regex: new RegExp(query, "i") } },
          { description: { $regex: new RegExp(query, "i") } },
          { hashtags: { $in: [new RegExp(query, "i")] } },
        ],
      }).exec();
      const eventsResult: eventsResource = {
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          creator: event.creator.toString(),
          description: event.description,
          price: event.price,
          date: event.date,
          address: event.address,
          thumbnail: event.thumbnail,
          hashtags: event.hashtags,
          category: event.category,
          chat: event.chat.toString(),
          participants: event.participants.map((participantId) =>
            participantId.toString()
          ),
        })),
      };
      return eventsResult;
    } catch (error) {
      throw new Error("Error searching events");
    }
  }

  /**
   * Am Event teilnehmen ( Event Teilnehmer )
   */
  async joinEvent(userID: string, eventID: string): Promise<boolean> {
    if (!userID) throw new Error(`User ID: ${userID} is invalid.`);
    if (!eventID) throw new Error(`Event ID: ${eventID} is invalid.`);
    const user = await User.findById(userID).exec();
    const event = await Event.findById(eventID).exec();
    if (!user) throw new Error("User not found");
    if (!event) throw new Error("Event not found");
    if (event.participants.includes(user._id)) {
      throw new Error("User is already participating in the event");
    }
    try {
      event.participants.push(user._id);
      await event.save();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Alle teilgenommenen Events abrufen ( Event Teilnehmer )
   */
  async getJoinedEvents(userID: string): Promise<eventsResource> {
    try {
      const events = await Event.find({ participants: userID }).exec();
      const eventsResult: eventsResource = {
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          creator: event.creator.toString(),
          description: event.description,
          price: event.price,
          date: event.date,
          address: event.address,
          thumbnail: event.thumbnail,
          hashtags: event.hashtags,
          category: event.category,
          chat: event.chat.toString(),
          participants: event.participants.map((participantId) =>
            participantId.toString()
          ),
        })),
      };
      return eventsResult;
    } catch (error) {
      throw new Error("Error getting events");
    }
  }

  /**
   * Teilnahme am Event absagen ( Event Teilnehmer )
   */
  async cancelEvent(userID: string, eventID: string): Promise<boolean> {
    if (!userID) throw new Error(`User ID: ${userID} is invalid.`);
    if (!eventID) throw new Error(`Event ID: ${eventID} is invalid.`);
    const event = await Event.findById(eventID).exec();
    if (!event) throw new Error("Event not found");
    if (event.creator && event.creator.toString() === userID)
      throw new Error("Can not cancel participation as event manager");
    const index = event.participants.findIndex((participant) => {
      return participant.equals(new Types.ObjectId(userID));
    });
    if (index === -1) {
      throw new Error("User is not participating in the event");
    }
    try {
      event.participants.splice(index, 1);
      await event.save();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Alle Teilnehmer vom Event abrufen ( Event Manager / Admin )
   */
  async getParticipants(
    eventID: string,
    creatorID: string
  ): Promise<usersResource> {
    try {
      const event = await Event.findById(eventID).exec();
      if (!event) throw new Error("Event not found");
      const creator = await User.findById(event.creator).exec();
      const user = await User.findById(creatorID);
      if (
        !creator ||
        !user ||
        (creator.id !== creatorID && !user.isAdministrator)
      ) {
        throw new Error("Invalid authorization");
      }
      const participantIDs = event.participants;
      const participants = await User.find({
        _id: { $in: participantIDs },
      }).exec();
      const result: usersResource = {
        users: participants.map((user) => ({
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
      return result;
    } catch (error) {
      throw new Error("Error getting participants");
    }
  }

  /**
   * Event bearbeiten ( Event Manager / Admin )
   */
  async updateEvent(
    eventID: string,
    eventResource: eventResource,
    userID: string
  ): Promise<eventResource> {
    const event = await Event.findById(eventID).exec();
    if (!event) throw new Error("Event not found");
    const creator = await User.findById(event.creator).exec();
    const user = await User.findById(userID).exec();
    if (
      !creator ||
      !user ||
      (creator._id.toString() !== userID && !user.isAdministrator)
    ) {
      throw new Error("Invalid authorization");
    }
    if (eventResource.name) event.name = eventResource.name;
    if (eventResource.description)
      event.description = eventResource.description;
    if (eventResource.price !== undefined) {
      if (eventResource.price < 0) {
        throw new Error("Event price cannot be less than 0");
      } else if (eventResource.price === 0) {
        event.price = 0;
      } else {
        event.price = eventResource.price;
      }
    }
    if (eventResource.date) event.date = eventResource.date;
    if (eventResource.address) event.address = eventResource.address;
    if (eventResource.thumbnail) event.thumbnail = eventResource.thumbnail;
    if (eventResource.hashtags) event.hashtags = eventResource.hashtags;
    if (eventResource.category) event.category = eventResource.category;
    const savedEvent = await event.save();
    return {
      id: savedEvent.id,
      name: savedEvent.name,
      creator: savedEvent.creator.toString(),
      description: savedEvent.description,
      price: savedEvent.price,
      date: savedEvent.date,
      address: savedEvent.address,
      thumbnail: savedEvent.thumbnail,
      hashtags: savedEvent.hashtags,
      category: savedEvent.category,
      chat: savedEvent.chat.toString(),
      participants: savedEvent.participants.map((participantId) =>
        participantId.toString()
      ),
    };
  }

  /**
   * Event löschen ( Event Manager / Admin )
   */
  async deleteEvent(eventID: string, userID: string): Promise<boolean> {
    try {
      const event = await Event.findById(eventID).exec();
      if (!event) throw new Error("Event not found");
      const creator = await User.findById(event.creator).exec();
      const user = await User.findById(userID).exec();
      if (
        !creator ||
        !user ||
        (creator._id.toString() !== userID && !user.isAdministrator)
      ) {
        throw new Error("Invalid authorization");
      }
      await Chat.deleteOne({ _id: event.chat }).exec();
      const result = await Event.deleteOne({ _id: eventID }).exec();
      if (result.deletedCount === 1) {
        await commentService.deleteCommentsOfevent(eventID);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error("Error deleting event");
    }
  }
}

export default new EventService();
