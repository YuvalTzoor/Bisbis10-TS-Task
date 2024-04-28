import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const addRating = async (req: Request, res: Response) => {
	try {
		const { restaurantId, rating } = req.body;

		
		if (!restaurantId || rating === undefined) {
			return res
				.status(400)
				.json({ error: "Missing required fields: restaurantId and rating" });
		}

		if (rating < 1 || rating > 5) {
			return res.status(400).json({ error: "Rating must be between 1 and 5" });
		}

	
		const restaurant = await prisma.restaurant.findUnique({
			where: { id: restaurantId },
		});

		if (!restaurant) {
			return res.status(404).json({ error: "Restaurant not found" });
		}

	
		const newRating = await prisma.rating.create({
			data: {
				restaurantId,
				rating,
			},
		});

		const updateAverageRating = async (restaurantId: number) => {
			const ratings = await prisma.rating.findMany({
				where: { restaurantId },
			});

			const totalRatings = ratings.length;
			const totalRating = ratings.reduce(
				(acc, rating) => acc + Number(rating.rating),
				0
			);
			const averageRating = totalRating / totalRatings;

			await prisma.restaurant.update({
				where: { id: restaurantId },
				data: { averageRating },
			});
		};

		await updateAverageRating(restaurantId);

		res.status(200).end();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};
