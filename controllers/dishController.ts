import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const addDish = async (req: Request, res: Response) => {
	try {
		const { name, description, price } = req.body;
		const restaurantId = parseInt(req.params.id);

		if (!name || !description || !price) {
			return res
				.status(400)
				.json({ error: "Name, description, and price are required fields" });
		}

		if (isNaN(restaurantId)) {
			return res.status(400).json({ error: "Invalid restaurant ID" });
		}

		const dish = await prisma.dish.create({
			data: {
				name,
				description,
				price,
				restaurantId,
			},
		});

		res.status(201).end();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateDish = async (req: Request, res: Response) => {
	try {
		const dishId = parseInt(req.params.dishId);
		const updates = req.body;

		if (isNaN(dishId)) {
			return res.status(400).json({ error: "Invalid dish ID" });
		}

		const dish = await prisma.dish.update({
			where: { id: dishId },
			data: updates,
		});

		res.status(200).end();
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "Dish not found" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
};

export const deleteDish = async (req: Request, res: Response) => {
	try {
		const dishId = parseInt(req.params.dishId);

		if (isNaN(dishId)) {
			return res.status(400).json({ error: "Invalid dish ID" });
		}

		await prisma.dish.delete({
			where: { id: dishId },
		});

		res.sendStatus(204).end();
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "Dish not found" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
};

export const getDishesByRestaurant = async (req: Request, res: Response) => {
	try {
		const restaurantId = parseInt(req.params.id);

		if (isNaN(restaurantId)) {
			return res.status(400).json({ error: "Invalid restaurant ID" });
		}

		const dishes = await prisma.dish.findMany({
			where: { restaurantId },
		});
		console.log(dishes);

		if (dishes.length === 0) {
			return res
				.status(404)
				.json({ error: "Restaurant not found or not dishes found" });
		}
		
		const dishesFinal = dishes.map((dish) => {
			return {
				...dish,
				price: parseInt(dish.price.toString()),
			};
		});


		res.status(200).json(dishesFinal);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};
