import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const placeOrder = async (req: Request, res: Response) => {
	try {
		const { restaurantId, orderItems } = req.body;

		if (!restaurantId) {
			return res.status(400).json({ error: "Restaurant ID is required" });
		}

		if (!orderItems || orderItems.length === 0) {
			return res
				.status(400)
				.json({ error: "At least one order item is required" });
		}

		const restaurant = await prisma.restaurant.findUnique({
			where: { id: restaurantId },
		});

		if (!restaurant) {
			return res.status(404).json({ error: "Restaurant not found" });
		}

		const dishes = await prisma.dish.findMany({
			where: {
				id: {
					in: orderItems.map((item: { dishId: any }) => item.dishId),
				},
			},
		});

		if (dishes.length !== orderItems.length) {
			return res.status(400).json({ error: "One or more dishes not found" });
		}

		const order = await prisma.order.create({
			data: {
				restaurantId,
				orderItems: {
					createMany: {
						data: orderItems,
					},
				},
			},
		});

		res.status(200).json(order.id);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};
