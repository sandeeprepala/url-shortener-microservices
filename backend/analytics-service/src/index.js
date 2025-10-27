import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import redisClient from "../config/redis.js";
import Url from "./model/urlModel.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set. Analytics service cannot start.");
  process.exit(1);
}

// ✅ Background queue processor
async function processQueue() {
  console.log("📥 Listening to Redis visitQueue...");

  while (true) {
    try {
      const data = await redisClient.blPop("visitQueue", 0);
      if (!data) continue;

      const message = JSON.parse(data.element);
      const { shortCode } = message;

      console.log(`🔹 Processing visit for: ${shortCode}`);

      await Url.findOneAndUpdate(
        { shortCode },
        { $inc: { visitCount: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error("❌ Error processing queue:", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Analytics service connected to MongoDB");
    processQueue();

    // ✅ Health check
    app.get("/", (req, res) => {
      res.send("📊 Analytics Service is Running...");
    });

    // ✅ Get analytics for one shortCode
    app.get("/analytics/:shortCode", async (req, res) => {
      try {
        const { shortCode } = req.params;
        const urlData = await Url.findOne({ shortCode });

        if (!urlData) {
          return res.status(404).json({ error: "Short URL not found" });
        }

        res.status(200).json({
          success: true,
          analytics: {
            originalUrl: urlData.originalUrl,
            shortCode: urlData.shortCode,
            visitCount: urlData.visitCount,
            createdAt: urlData.createdAt,
          },
        });
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ✅ NEW ROUTE: Get Top 10 most clicked links of today
    app.get("/analytics/top/today", async (req, res) => {
      try {
        // Get start and end of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch top 10 URLs created today with highest visitCount
        const topUrls = await Url.find({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        })
          .sort({ visitCount: -1 })
          .limit(10)
          .select("shortCode originalUrl visitCount createdAt -_id");

        res.status(200).json({
          success: true,
          count: topUrls.length,
          topUrls,
        });
      } catch (error) {
        console.error("❌ Error fetching top URLs:", error);
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
