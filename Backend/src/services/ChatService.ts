import { ChatResource } from "../Resources";
import { Event, Chat } from "../model/EventModel";
import { User } from "../model/UserModel";
import { dateToStringWithTime } from "./ServiceHelper";

export class ChatService {
  async getChat(chatID: string): Promise<ChatResource> {
    if (!chatID) throw new Error(`Chat ID: ${chatID} is invalid.`);
    const chat = await Chat.findById(chatID).exec();
    if (!chat) throw new Error("Chat not found");
    return {
      id: chat.id,
      event: chat.event.toString(),
      messages: await Promise.all(
        chat.messages.map(async (message) => {
          const user = await User.findById(message.user);
          return {
            user: message.user.toString(),
            username: `${user.name.first} ${user.name.last}`,
            message: message.message.toString(),
            time: dateToStringWithTime(message.time),
          };
        })
      ),
    };
  }

  async sendMessage(
    chatID: string,
    userID: string,
    message: string
  ): Promise<ChatResource> {
    if (!chatID) throw new Error(`Chat ID: ${chatID} is invalid.`);
    const chat = await Chat.findById(chatID).exec();
    if (!chat) throw new Error("Chat not found");
    const user = await User.findById(userID).exec();
    if (!user) throw new Error("User not found");
    const event = await Event.findById(chat.event).exec();
    if (!event) throw new Error("Event not found");
    if (!event.participants.includes(user._id)) {
      throw new Error("User is not participating in the event");
    }

    chat.messages.push({ user: user._id, message: message, time: new Date() });
    const newChat = await chat.save();
    return {
      id: newChat.id,
      event: newChat.event.toString(),
      messages: await Promise.all(
        newChat.messages.map(async (message) => {
          const user = await User.findById(message.user);
          return {
            user: message.user.toString(),
            username: `${user.name.first} ${user.name.last}`,
            message: message.message.toString(),
            time: dateToStringWithTime(message.time),
          };
        })
      ),
    };
  }
}
