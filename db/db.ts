import { Client } from "pg";

const defaultClient = new Client({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "example",
	database: "postgres",
});

let client: Client;

async function connectToDefaultDatabase() {
	try {
		await defaultClient.connect();
		console.log("Connected to the default database successfully.");
	} catch (err) {
		console.error("Could not connect to the default database.", err);
		process.exit(1);
	}
}

async function createNewDatabase(dbName: string) {
	try {
		const dbExists = await defaultClient.query(
			`SELECT 1 FROM pg_database WHERE datname='${dbName}'`
		);
		if (dbExists.rowCount === 0) {
			await defaultClient.query(`CREATE DATABASE "${dbName}"`);
			console.log(`Database ${dbName} created successfully.`);
		}
	} catch (err) {
		console.error(`Could not create database ${dbName}.`, err);
		process.exit(1);
	} finally {
		await defaultClient.end();
	}
}

async function connectToNewDatabase(dbName: string) {
	client = new Client({
		host: "localhost",
		port: 5432,
		user: "postgres",
		password: "example",
		database: dbName,
	});

	try {
		await client.connect();
		console.log(`Connected to the database ${dbName} successfully.`);
	} catch (err) {
		console.error(`Could not connect to the database ${dbName}.`, err);
		process.exit(1);
	}
}
//Initialize the database with the required tables
async function createTables() {
	const createTablesSql = `
        CREATE TABLE IF NOT EXISTS restaurants (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            is_kosher BOOLEAN NOT NULL,
            cuisines TEXT[] NOT NULL,
            average_rating NUMERIC(3, 1)
        );
        CREATE TABLE IF NOT EXISTS dishes (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            CONSTRAINT fk_restaurant
                FOREIGN KEY(restaurant_id) 
                REFERENCES restaurants(id)
                ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL,
            rating NUMERIC(3, 1),
            CONSTRAINT fk_restaurant_ratings
                FOREIGN KEY(restaurant_id) 
                REFERENCES restaurants(id)
                ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL,
            order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_order_restaurant
                FOREIGN KEY(restaurant_id) 
                REFERENCES restaurants(id)
                ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL,
            dish_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            CONSTRAINT fk_order
                FOREIGN KEY(order_id) 
                REFERENCES orders(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_dish
                FOREIGN KEY(dish_id) 
                REFERENCES dishes(id)
                ON DELETE CASCADE
        );
    `;

	try {
		await client.query(createTablesSql);
		console.log("Tables created successfully.");
	} catch (err) {
		console.error("Error creating tables.", err);
		process.exit(1);
	}
}

async function initializeDatabase() {
	const dbName = "RestAPIDB";

	await connectToDefaultDatabase();
	await createNewDatabase(dbName);
	await connectToNewDatabase(dbName);
	await createTables();
}

initializeDatabase();

export default () => client;
