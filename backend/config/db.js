import mongoose from "mongoose";
import dns from "dns";
import { info, error as logError } from "../utils/logger.js";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retryCount = 0) => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    // Clean the connection string to remove any BOM or encoding issues
    let mongoUri = process.env.MONGO_URI || "";
    mongoUri = mongoUri.replace(/^\?o/g, "").replace(/\?\?$/g, "").trim();

    if (!mongoUri) {
      logError("❌ MONGO_URI environment variable is missing!");
      if (process.env.VERCEL) {
        return;
      }
      throw new Error("MONGO_URI environment variable is missing");
    }

    // Ensure it starts with mongodb:// or mongodb+srv://
    if (
      !mongoUri.startsWith("mongodb://") &&
      !mongoUri.startsWith("mongodb+srv://")
    ) {
      logError("❌ Invalid MongoDB connection string format");
      if (process.env.VERCEL) {
        return;
      }
      throw new Error("Invalid MongoDB connection string format");
    }

    // Only set fallback DNS on Windows local development (fixes querySrv ECONNREFUSED)
    if (process.platform === "win32" && mongoUri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (dnsErr) {
        // Fallback to default system DNS if setServers fails
      }
    }

    // Connection options with pooling
    const isServerless = Boolean(process.env.VERCEL);
    const options = {
      maxPoolSize: isServerless ? 10 : 50,
      minPoolSize: isServerless ? 1 : 10,
      serverSelectionTimeoutMS: isServerless ? 5000 : 30000,
      socketTimeoutMS: isServerless ? 15000 : 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoUri, options);

    info(`📦 MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
      poolSize: options.maxPoolSize,
    });

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      info("MongoDB connection established");
    });

    mongoose.connection.on("error", (err) => {
      logError("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logError("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      info("MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    logError(`❌ MongoDB Connection Error: ${err.message}`, {
      error: err.message,
      retryCount,
    });

    if (process.env.VERCEL) {
      // In serverless environments, do not run blocking retry sleep loops and NEVER call process.exit(1)
      throw err;
    }

    // Retry logic with exponential backoff for standalone servers
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      info(`Retrying connection in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    } else {
      logError("Max retry attempts reached. Exiting...");
      process.exit(1);
    }
  }
};

export default connectDB;
