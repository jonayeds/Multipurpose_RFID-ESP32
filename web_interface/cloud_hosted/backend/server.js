require("dotenv").config();

const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const mongoClient = new MongoClient(databaseUrl);
const Card = mongoClient.db().collection("cards");
const Reader = mongoClient.db().collection("readers");

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

const api = express.Router();
app.use("/api/v1", api);

api.post("/register-card", async (request, response) => {
  try {
    const data = request.body;
    if (
      !data ||
      !data.fullname ||
      !data.email ||
      !data.phoneNumber ||
      !data.cardPassword ||
      (data.balance!==0 && !data.balance)
    ) {
      console.log(data)
      throw new Error("Data not fulfilled to register card");
    }
    const result = await Card.insertOne(request.body);
    response.status(201).json({
      message: "Card registered successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Unable to register card:", error.message);
    response
      .status(500)
      .json({ error: error.message || "Unable to register card" });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

async function startServer() {
  await mongoClient.connect();
  await mongoClient.db().command({ ping: 1 });
  console.log("Connected to MongoDB");

  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to connect to MongoDB:", error.message);
  process.exit(1);
});
