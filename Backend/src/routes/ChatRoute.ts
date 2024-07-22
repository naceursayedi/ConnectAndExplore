import express from "express";
import { ChatService } from "../services/ChatService";
import { requiresAuthentication } from "./authentication";
import { body, param } from "express-validator";
import { Event } from "../model/EventModel";
import { Types } from "mongoose";

const ChatRouter = express.Router();
const chatService = new ChatService();

ChatRouter.get(
  "/:id",
  requiresAuthentication,
  param("id").isMongoId(),
  async (req, res) => {
    try {
      const chat = await chatService.getChat(req.params.id);
      const event = await Event.findById(chat.event).exec();
      if (!event.participants.includes(new Types.ObjectId(req.userId))) {
        return res.status(403).json("User is not participating in the event");
      }
      res.status(200).send(chat);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

ChatRouter.post(
  "/:id",
  requiresAuthentication,
  param("id").isMongoId(),
  body("message").isString().notEmpty(),
  async (req, res) => {
    try {
      const chat = await chatService.sendMessage(
        req.params.id,
        req.userId,
        req.body.message
      );
      res.status(200).send(chat);
    } catch (error) {
      if (error.message === "User is not participating in the event") {
        return res.status(403).json({ Error: error.message });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default ChatRouter;
