import app from "../backend/app.js";
import connectDB from "../backend/config/db.js";

let dbPromise = null;

export default async function handler(req, res) {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      console.error("Vercel DB Connection Error:", err.message || err);
      dbPromise = null;
    });
  }

  try {
    await dbPromise;
  } catch (error) {
    console.error("Vercel DB Await Error:", error.message || error);
  }

  return app(req, res);
}

