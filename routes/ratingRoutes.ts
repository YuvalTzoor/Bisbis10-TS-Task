import express from "express";
import * as ratingController from "../controllers/ratingController";

const router = express.Router();

router.post("/", ratingController.addRating);

export default router;
