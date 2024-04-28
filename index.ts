import express from "express";
import dotenv from "dotenv";
import getClient from "./db/db";
import restaurantRoutes from "./routes/restaurantRoutes";
import ratingRoutes from "./routes/ratingRoutes";
import dishRoutes from "./routes/dishRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8000;
app.use(bodyParser.json());
app.use("/", (req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, DELETE, OPTIONS, PUT"
	);
	next();
});
app.use("/restaurants", restaurantRoutes);
app.use("/ratings", ratingRoutes);
app.use("/order", orderRoutes);
app.use("/restaurants", dishRoutes);

app.listen(port, () => {
	console.log(`Server is On at http://localhost:${port}`);
});

process.on("SIGINT", () => {
	getClient().end((err) => {
		if (err) {
			console.error("error during disconnection", err.stack);
		}
		process.exit();
	});
});

process.on("SIGTERM", () => {
	getClient().end((err) => {
		if (err) {
			console.error("error during disconnection", err.stack);
		}
		process.exit();
	});
});
