import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from "./db/db.controllers.js";
import app from "./app.js";

console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ loaded" : "❌ missing");

connectDB()
  .then(() => {
    console.log(`⚙️ MongoDB connected successfully!\n`);
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MONGODB connection failed: ", err);
  });
