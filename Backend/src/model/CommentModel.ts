import { Schema, Types, model } from "mongoose";

export interface IBaseComment {
  title: string;
  stars: number;
  content: string;
  edited: boolean;
  createdAt?: Date;
}

export interface IComment extends IBaseComment {
  creator: Types.ObjectId;
  event: Types.ObjectId;
}

const comentSchema = new Schema<IComment>(
  {
    title: { type: String, required: true },
    stars: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) => value >= 1 && value <= 5,
        message: "Stars must be between 0 and 5.",
      },
    },
    content: { type: String, required: true },
    edited: { type: Boolean, default: false },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  },
  { timestamps: true }
);

export const Comment = model<IComment>("Comment", comentSchema);
