import express from "express";
import * as dishController from "../controllers/dishController";

const router = express.Router();

router.post("/:id/dishes", dishController.addDish);
router.put("/:id/dishes/:dishId", dishController.updateDish);
router.delete("/:id/dishes/:dishId", dishController.deleteDish);
router.get("/:id/dishes", dishController.getDishesByRestaurant);

export default router;
