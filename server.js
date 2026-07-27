import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

try {
  console.log("Starting server...");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Mongo URI exists:", !!process.env.MONGODB_URI);

  await connectDB();

  console.log("MongoDB Connected");

  export default app;
} catch (err) {
  console.error("SERVER STARTUP ERROR:", err);
  throw err;
}