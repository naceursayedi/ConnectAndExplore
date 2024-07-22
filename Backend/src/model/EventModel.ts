import { Model, Schema, Types, model } from "mongoose";

export interface IEAddress {
  street: String;
  houseNumber: String;
  apartmentNumber?: String;
  postalCode: String;
  city: String;
  stateOrRegion?: String;
  country: String;
}
export interface IEvent {
  name: string;
  creator: Types.ObjectId;
  description: string;
  price: number;
  date: Date;
  address: IEAddress;
  thumbnail?: string;
  hashtags?: string[];
  category: ICategory[];
  chat: Types.ObjectId;
  participants: Types.ObjectId[];
}

export interface ICategory {
  name: string;
  description: string;
}

export interface IChat {
  event: Types.ObjectId;
  messages: { user: Types.ObjectId; message: String; time: Date }[];
}

/**
 * Adressen werden später in das EventSchema eingefügt und als teil eines Users in mongoDB gespeichert
 */
export const addressESchema = new Schema({
  street: { type: String, required: true },
  houseNumber: { type: String, required: true },
  apartmentNumber: String,
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  stateOrRegion: String,
  country: { type: String, required: true },
});
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true /* , unique: true */ },
  description: { type: String },
});

const chatSchema = new Schema<IChat>({
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  messages: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      message: String,
      time: Date,
    },
  ],
});

type EventModel = Model<IEvent, {}>;
type CategoryModel = Model<ICategory, {}>;
type ChatModel = Model<IChat, {}>;

const eventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  address: addressESchema,
  thumbnail: { type: String },
  hashtags: [{ type: String }],
  category: [categorySchema],
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
});

export const Event = model<IEvent, EventModel>("Event", eventSchema);
export const Categoty = model<ICategory, CategoryModel>(
  "Category",
  categorySchema
);
export const Chat = model<IChat, ChatModel>("Chat", chatSchema);
