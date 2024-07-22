import express from "express";
import { requiresAuthentication } from "./authentication";
import { body, matchedData, validationResult } from "express-validator";
import { RatingType } from "../model/RatingModel";
import { RatingResource } from "../Resources";
import { RatingService } from "../services/RatingService";

const RatingRouter = express.Router();
const ratingService = new RatingService();

RatingRouter.post(
  "/rating",
  requiresAuthentication,
  body("comment").isMongoId(),
  body("creator").isMongoId(),
  body("ratingType")
    .isIn([RatingType.Helpful, RatingType.Reported])
    .withMessage("invalid ratingtype."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const rating = matchedData(req) as RatingResource;
    if (rating.creator !== req.userId) {
      res.status(403);
      next(new Error("unauthorized."));
    }
    try {
      const result = await ratingService.createRating(rating);
      res.status(201).send(result);
    } catch (err) {
      res.status(400);
      next(err);
    }
  }
);

export default RatingRouter;
