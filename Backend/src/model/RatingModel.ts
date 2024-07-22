import { Schema, Types, model } from "mongoose";

export interface IRating {
  comment: Types.ObjectId; //Referenz zum Kommentar
  creator: Types.ObjectId; //Benutzer, der bewertet hat
  ratingType: RatingType; //Bewertungstyp: hilfreich, nicht hilfreich, gemeldet
}

export enum RatingType {
  Helpful = "helpful",
  Reported = "reported",
}

const ratingSchema = new Schema<IRating>({
  comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ratingType: { type: String, enum: Object.values(RatingType), required: true },
});

export const Rating = model<IRating>("Rating", ratingSchema);
