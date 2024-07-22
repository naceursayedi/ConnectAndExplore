import { RatingType } from "./model/RatingModel";

export type userResource = {
  id?: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  password?: string;
  isAdministrator: Boolean;
  address: addressResource;
  profilePicture?: string;
  birthDate: Date;
  gender: string;
  socialMediaUrls?: {
    facebook?: string;
    instagram?: string;
  };
  isActive: boolean;
  oldPassword?: string;
};
export type userResourceNA = {
  id?: string;
  name: {
    first: string;
    last: string;
  };
  profilePicture?: string;
  isActive: boolean;
};
export type usersResource = {
  users: userResource[];
};
export type usersResourceNA = {
  users: userResourceNA[];
};
export type addressResource = {
  id?: string;
  postalCode: String;
  city: String;
};
export type addressEResource = {
  id?: string;
  street: String;
  houseNumber: String;
  apartmentNumber?: String;
  postalCode: String;
  city: String;
  stateOrRegion?: String;
  country: String;
};
export type LoginResource = {
  /** The JWT */
  access_token: string;
  /** Constant value */
  token_type: "Bearer";
};

export type eventResource = {
  id?: string;
  name: string;
  creator?: string;
  creatorName?: {
    first: string;
    last: string;
  };
  description: string;
  price: number;
  date: Date;
  address: addressEResource;
  thumbnail?: string;
  hashtags?: string[];
  category?: categoryResource[];
  chat?: string;
  participants?: string[];
};

export type eventsResource = {
  events: eventResource[];
};

export type categoryResource = {
  id?: string;
  name: string;
  description: string;
};

export type CommentsResource = {
  comments: CommentResource[];
};

export type CommentResource = {
  id?: string;
  title: string;
  stars: number;
  content: string;
  edited: boolean;
  createdAt?: string;
  creator: string;
  creatorName?: {
    first: string;
    last: string;
  };
  event: string;
  eventName?: string;
};

export type RatingsResource = {
  ratings: RatingResource[];
};

export type RatingResource = {
  id?: string;
  comment: string;
  creator: string;
  ratingType: RatingType;
};

export type CommentWithRatingsResource = {
  id?: string;
  title: string;
  stars: number;
  content: string;
  edited: boolean;
  createdAt?: string;
  creator: string;
  creatorName?: {
    first: string;
    last: string;
  };
  event: string;
  ratings: RatingsResource;
};

export type CommentsWithRatingsResource = {
  comments: CommentWithRatingsResource[];
};

export type MessageResource = {
  user: string;
  username?: string;
  message: string;
  time?: string;
};

export type ChatResource = {
  id?: string;
  event: string;
  messages: MessageResource[];
};
