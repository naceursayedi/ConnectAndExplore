import { RatingResource, RatingsResource } from "../Resources";
import { User } from "../model/UserModel";
import { Comment } from "../model/CommentModel";
import { Rating } from "../model/RatingModel";
import { Types } from "mongoose";

export class RatingService {
  async getRatingsOfComment(commentId: string): Promise<RatingsResource> {
    const comment = await Comment.findById(commentId).exec();
    if (!comment) {
      throw new Error(`No comment with id: ${commentId} of rating found.`);
    }
    const ratings = await Rating.find({ comment: commentId }).exec();
    const result: RatingsResource = {
      ratings: ratings.map((rating) => {
        const r: RatingResource = {
          id: rating.id,
          comment: comment.id,
          creator: rating.creator.toString(),
          ratingType: rating.ratingType,
        };
        return r;
      }),
    };
    return result;
  }

  async createRating(rating: RatingResource): Promise<RatingResource> {
    const user = await User.findById(rating.creator).exec();
    if (!user) {
      throw new Error(
        `No creator with id: ${rating.creator} of rating found. Can not create Rating.`
      );
    }
    const comment = await Comment.findById(rating.comment).exec();
    if (!comment) {
      throw new Error(
        `No comment with id: ${rating.comment} of rating found. Can not create Rating.`
      );
    }
    if (user.id == comment.creator) {
      throw new Error("Users cannot rate their own comments.");
    }
    const dupe = await Rating.find({
      comment: comment.id,
      creator: user.id,
    }).exec();
    if (dupe.length > 0) throw new Error("Already rated this comment.");

    const createdRating = await Rating.create(rating);

    const res: RatingResource = {
      ...rating,
      id: createdRating.id,
    };
    return res;
  }

  async updateRating(rating: RatingResource): Promise<RatingResource> {
    if (!rating.id) {
      throw new Error(`No ratingId:${rating.id} found, can not update rating`);
    }
    const recievedRating = await Rating.findById(rating.id).exec();
    if (!recievedRating) {
      throw new Error(
        `No rating with id:${rating.id} found, can not update rating`
      );
    }

    const user = await User.findById({
      _id: new Types.ObjectId(rating.creator),
    }).exec();
    if (!user) {
      throw new Error(
        `No creator with id: ${rating.creator} of rating found. Can not update rating.`
      );
    }
    const comment = await Comment.findById({
      _id: new Types.ObjectId(rating.comment),
    }).exec();
    if (!comment) {
      throw new Error(
        `No comment with id: ${rating.comment} of rating found. Can not update rating.`
      );
    }

    if (
      recievedRating.creator != user.id ||
      recievedRating.comment != comment.id
    )
      throw new Error("userID or commentID does not match.");

    if (rating.ratingType) recievedRating.ratingType = rating.ratingType;

    const res = await recievedRating.save();
    return {
      id: res.id,
      comment: res.comment.toString(),
      creator: res.creator.toString(),
      ratingType: res.ratingType,
    };
  }

  async deleteRating(id: string): Promise<void> {
    if (!id) {
      throw new Error(`RatingId missing, can not delete.`);
    }
    const res = await Rating.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount !== 1) {
      throw new Error(`No rating with id ${id} deleted, probably id not valid`);
    }
  }

  async deleteRatingsOfUser(userId: string): Promise<void> {
    if (!userId) {
      throw new Error(`UserId missing, can not delete.`);
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error(`User with id: ${userId} missing, can not delete.`);
    }
    await Rating.deleteMany({ creator: userId }).exec();
  }

  async deleteRatingsOfComment(commentId: string): Promise<void> {
    if (!commentId) {
      throw new Error(`CommentId missing, can not delete.`);
    }
    const comment = await Comment.findById(commentId).exec();
    if (!comment) {
      throw new Error(`Comment with id: ${commentId} missing, can not delete.`);
    }
    await Rating.deleteMany({ comment: new Types.ObjectId(commentId) }).exec();
  }
}
