import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllRestaurants = async (req: Request, res: Response) => {
	try {
		if (req.query.cuisine) {
			const cuisine = req.query.cuisine as string;
			const restaurants = await prisma.restaurant.findMany({
				where: {
					cuisines: {
						has: cuisine,
					},
				},
			});

			res.status(200).json(restaurants);
			return;
		}
		const restaurants = await prisma.restaurant.findMany();

		res.status(200).json(restaurants);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getRestaurantById = async (req: Request, res: Response) => {
	try {
		const restaurantId = parseInt(req.params.id);

		if (isNaN(restaurantId)) {
			return res.status(400).json({ error: "Invalid restaurant ID" });
		}

		const restaurant = await prisma.restaurant.findUnique({
			where: { id: restaurantId },
			include: {
				dishes: true, 
			},
		});

		if (restaurant) {
			const restaurantWithDishes = {
				id: restaurant.id.toString(), 
				name: restaurant.name,
				averageRating: restaurant.averageRating,
				isKosher: restaurant.isKosher,
				cuisines: restaurant.cuisines,
				dishes: restaurant.dishes.map((dish) => ({
					id: dish.id.toString(), 
					name: dish.name,
					description: dish.description,
					price: parseInt(dish.price.toString()), 
				})),
			};
			res.status(200).json(restaurantWithDishes);
		} else {
			res.status(404).json({ error: "Restaurant not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const createRestaurant = async (req: Request, res: Response) => {
	try {
		const { name, isKosher, cuisines } = req.body;
		
		if (!name) {
			return res.status(400).json({ error: "Name is required" });
		}

		if (!Array.isArray(cuisines)) {
			return res.status(400).json({ error: "Cuisines must be an array" });
		}

		if (cuisines.length === 0) {
			return res.status(400).json({ error: "Cuisines cannot be empty" });
		}

		const restaurant = await prisma.restaurant.create({
			data: {
				name,
				isKosher: isKosher || false,
				cuisines,
			},
		});

		res.status(201).end();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateRestaurant = async (req: Request, res: Response) => {
	try {
		const { name, isKosher, cuisines } = req.body;

		const restaurantId = parseInt(req.params.id);
		if (!cuisines) {
			return res.status(400).json({ error: "Cuisines is required" });
		}
		if (!name || isKosher === undefined && !cuisines) {
			return res.status(400).json({ error: "At least one field is required" });
		}

		if (isNaN(restaurantId)) {
			return res.status(400).json({ error: "Invalid restaurant ID" });
		}

		const restaurant = await prisma.restaurant.findUnique({
			where: { id: restaurantId },
		});

		if (!restaurant) {
			return res.status(404).json({ error: "Restaurant not found" });
		}

		const updatedRestaurant = await prisma.restaurant.update({
			where: { id: restaurantId },
			data: {
				name: name || restaurant.name,
				isKosher: isKosher !== undefined ? isKosher : restaurant.isKosher,
				cuisines: cuisines || restaurant.cuisines,
			},
		});

		res.status(200).end();
	} catch (error) {
		console.log("in error");
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteRestaurant = async (req: Request, res: Response) => {
	try {
		const restaurantId = parseInt(req.params.id);

		if (isNaN(restaurantId)) {
			return res.status(400).json({ error: "Invalid restaurant ID" });
		}

		await prisma.restaurant.delete({
			where: { id: restaurantId },
		});

		res.sendStatus(204).end();
	} catch (error: any) {
		console.error(error);
		if (error.code === "P2025") {
			res.status(404).json({ error: "Restaurant not found" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
};
