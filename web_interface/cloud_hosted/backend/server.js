require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

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

function authenticateUser(expectedType) {
  return (request, response, next) => {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return response
        .status(401)
        .json({ error: "Authentication token required" });
    }

    try {
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      if (decodedUser.type !== expectedType) {
        return response
          .status(403)
          .json({ error: `${expectedType} authentication required` });
      }

      request.user = decodedUser;
      next();
    } catch (error) {
      return response.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

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

api.post("/login-card", async (request, response) => {
  try {
    const { email, cardPassword } = request.body;
    if (!email || !cardPassword) {
      throw new Error("Email and card password are required");
    }
    const card = await Card.findOne({ email });
    if (!card) {
      throw new Error("Card not found");
    }
    if (card.cardPassword !== cardPassword) {
      throw new Error("Invalid card password");
    }
    const token = jwt.sign(
      { id: card._id.toString(), email: card.email, type: "card" },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      },
    );
    response
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ token });
  } catch (error) {
    console.error("Unable to login card:", error.message);
    response
      .status(500)
      .json({ error: error.message || "Unable to login card" });
  }
});

api.post("/login-reader", async (request, response) => {
  try {
    const { email, readerPassword } = request.body;
    if (!email || !readerPassword) {
      throw new Error("Email and reader password are required");
    }

    const reader = await Reader.findOne({ email });
    if (!reader) {
      throw new Error("Reader not found");
    }
    if (reader.readerPassword !== readerPassword) {
      throw new Error("Invalid reader password");
    }

    const token = jwt.sign(
      { id: reader._id.toString(), email: reader.email, type: "reader" },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      },
    );
    response
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ token });
  } catch (error) {
    console.error("Unable to login reader:", error.message);
    response
      .status(500)
      .json({ error: error.message || "Unable to login reader" });
  }
});

api.get("/get-card/:cardId", async (request, response) => {
  try {
    const cardId = new ObjectId(request.params.cardId);
    const card = await Card.findOne({ _id: cardId });
    if (!card) {
      console.log(cardId);
      return response.status(404).json({ error: "Card not found" });
    }
    response.json(card);
  } catch (error) {
    console.error("Unable to fetch card:", error.message);
    response
      .status(500)
      .json({ error: error.message || "Unable to fetch card" });
  }
});

api.get("/get-my-card", authenticateUser("card"), async (request, response) => {
  try {
    const card = await Card.findOne({ _id: new ObjectId(request.user.id) });
    if (!card) {
      return response.status(404).json({ error: "Card not found" });
    }
    response.json(card);
  } catch (error) {
    console.error("Unable to fetch authenticated card:", error.message);
    response.status(400).json({ error: "Invalid card identifier" });
  }
});
api.get(
  "/get-my-reader",
  authenticateUser("reader"),
  async (request, response) => {
  try {
    const reader = await Reader.findOne({ _id: new ObjectId(request.user.id) });
    if (!reader) {
      return response.status(404).json({ error: "Reader not found" });
    }
    response.json(reader);
  } catch (error) {
    console.error("Unable to fetch authenticated reader:", error.message);
    response.status(400).json({ error: "Invalid reader identifier" });
  }
  },
);

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