const axios = require("axios");

const BASE_URL = "http://localhost:8000";

describe("Restaurant API", () => {
	let restaurantId = 1;
	let dishId = 1;

	// Restaurant endpoints
	it("should create a restaurant and capture the latest ID", async () => {
		const restaurantData = {
			name: "Test Restaurant",
			isKosher: true,
			cuisines: ["Italian", "Mexican"],
		};

		// Post request to create a new restaurant
		const postResponse = await axios.post(
			`${BASE_URL}/restaurants`,
			restaurantData
		);
		console.log("postResponse:", postResponse);
		expect(postResponse.status).toBe(201);

		const getResponse = await axios.get(`${BASE_URL}/restaurants`);
		const restaurants = getResponse.data;

		restaurantId = restaurants.reduce(
			(maxId, restaurant) => (restaurant.id > maxId ? restaurant.id : maxId),
			0
		);

		console.log("after reduce:", restaurantId);

		console.log("Created Restaurant ID:", restaurantId);
	});

	it("should get all restaurants", async () => {
		const response = await axios.get(`${BASE_URL}/restaurants`);
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});
	console.log(restaurantId);
	it("should get a restaurant by ID", async () => {
		console.log("Fetching Restaurant by ID:", restaurantId);
		const response = await axios.get(`${BASE_URL}/restaurants/${restaurantId}`);
		expect(response.status).toBe(200);
	});

	it("should update a restaurant", async () => {
		const updatedRestaurantData = {
			name: "Updated Test Restaurant",
			isKosher: false,
			cuisines: ["Italian", "Mexican", "French"],
		};

		console.log("Updating Restaurant ID:", restaurantId);
		const response = await axios.put(
			`${BASE_URL}/restaurants/${restaurantId}`,
			updatedRestaurantData
		);
		expect(response.status).toBe(200);
	});

	// Dish endpoints
	it("should add a dish to the restaurant", async () => {
		const dishData = {
			name: "Test Dish",
			description: "A delicious test dish",
			price: 10.99,
		};

		console.log("Adding Dish to Restaurant ID:", restaurantId);
		const response = await axios.post(
			`${BASE_URL}/restaurants/${restaurantId}/dishes`,
			dishData
		);
		expect(response.status).toBe(201);

		console.log("Created Dish ID:", dishId);
	});

	it("should get dishes by restaurant", async () => {
		console.log("Fetching Dishes for Restaurant ID:", restaurantId);
		const response = await axios.get(
			`${BASE_URL}/restaurants/${restaurantId}/dishes`
		);
		console.log(JSON.stringify(response.data) + "response");
		expect(response.status).toBe(200);
	});

	it("should update a dish", async () => {
		const updatedDishData = {
			description: "Updated description of the dish",
			price: 12.99,
		};

		const response1 = await axios.get(
			`${BASE_URL}/restaurants/${restaurantId}/dishes`
		);
		const dishes = response1.data;
		dishId = dishes.reduce((maxId, dish) => {
			return dish.id > maxId ? dish.id : maxId;
		}, 0);
		console.log("Updating Dish ID:", dishId);
		const response2 = await axios.put(
			`${BASE_URL}/restaurants/${restaurantId}/dishes/${dishId}`,
			updatedDishData
		);
		expect(response2.status).toBe(200);
	});

	// Order and rating endpoints assumed correct

	// Cleanup
	it("should delete the dish", async () => {
		console.log("Deleting Dish ID:", dishId);
		const response1 = await axios.get(
			`${BASE_URL}/restaurants/${restaurantId}/dishes`
		);
		const dishes = response1.data;
		dishId = dishes.reduce((maxId, dish) => {
			return dish.id > maxId ? dish.id : maxId;
		}, 0);
		const response2 = await axios.delete(
			`${BASE_URL}/restaurants/${restaurantId}/dishes/${dishId}`
		);
		expect(response2.status).toBe(204);
	});

	it("should delete the restaurant", async () => {
		console.log("Deleting Restaurant ID:", restaurantId);
		const response = await axios.delete(
			`${BASE_URL}/restaurants/${restaurantId}`
		);
		expect(response.status).toBe(204);
	});
});
