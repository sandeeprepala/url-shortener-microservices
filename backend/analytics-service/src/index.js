import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import redisClient from "../../url-service/config/redis.js";
import Url from "./model/urlModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());

// Ensure MONGO_URI is present
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not set. Analytics service cannot start.");
  process.exit(1);
}

// ✅ Function to process the Redis queue
async function processQueue() {
  console.log("📥 Listening to Redis visitQueue...");

  while (true) {
    try {
      const data = await redisClient.blPop("visitQueue", 0); // wait indefinitely
      if (!data) continue;

      const message = JSON.parse(data.element);
      const { shortCode } = message;

      console.log(`🔹 Processing visit for: ${shortCode}`);

      // Increment visit count in MongoDB
      const url = await Url.findOneAndUpdate(
        { shortCode },
        { $inc: { visitCount: 1 } },
        { new: true }
      );

      if (!url) {
        console.warn(`⚠️ No URL found for shortCode: ${shortCode}`);
      }
    } catch (error) {
      console.error("❌ Error processing queue:", error);
      // backoff on error to avoid busy-looping on persistent failures
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Start server AND queue processing only after successful MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Analytics service connected to MongoDB");

    // Start processing Redis queue (background)
    processQueue();

    // ✅ Health check route
    app.get("/", (req, res) => {
      res.send("📊 Analytics Service is Running...");
    });

    // ✅ Route: Get analytics data by shortCode
    app.get("/analytics/:shortCode", async (req, res) => {
      try {
        const { shortCode } = req.params;

        const urlData = await Url.findOne({ shortCode });
        if (!urlData) {
          return res.status(404).json({ error: "Short URL not found" });
        }

        const analytics = {
          originalUrl: urlData.originalUrl,
          shortCode: urlData.shortCode,
          visitCount: urlData.visitCount,
          createdAt: urlData.createdAt,
        };

        res.status(200).json({
          success: true,
          analytics,
        });
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Analytics service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
