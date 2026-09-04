require("dotenv").config();

const express = require("express");
const cors = require("cors"); 
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

// Enable CORS for all origins (allows Next.js & ESP32 local requests)
app.use(cors());
app.use(express.json());

// Reusable Database Connection
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoClient.connect();
    isConnected = true;
    console.log("Connected to MongoDB");
  }
}

// Connect before handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

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
      (data.balance !== 0 && !data.balance)
    ) {
      console.log(data);
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

api.post("/register-reader", async (request, response) => {
  try {
    const data = request.body;
    const validModes = ["doorlock", "payment", "identification"];
    const modeDataIsValid =
      (data?.mode === "doorlock" && Boolean(data.doorcode)) ||
      (data?.mode === "payment" &&
        typeof data.deductionAmount === "number" &&
        data.deductionAmount >= 0) ||
      (data?.mode === "identification" && Array.isArray(data.cardIds));

    if (
      !data ||
      !data.email ||
      !data.readerPassword ||
      !validModes.includes(data.mode) ||
      !modeDataIsValid
    ) {
      throw new Error("Data not fulfilled to register reader");
    }
    const result = await Reader.insertOne(request.body);
    response.status(201).json({
      message: "Reader registered successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Unable to register reader:", error.message);
    response
      .status(500)
      .json({ error: error.message || "Unable to register reader" });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running locally at http://localhost:${port}`);
  });
}

// 3. Export for Vercel serverless functions
module.exports = app;