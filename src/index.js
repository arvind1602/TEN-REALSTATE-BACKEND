import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

// Routers
import ContactRouter from "./controllers/Contact.Controller.js";
import ProjectRouter from "./controllers/Projects.Controller.js";
import TestimonialRouter from "./controllers/Testimonial.Controller.js";
dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api", ContactRouter);
app.use("/api", ProjectRouter);
app.use("/api", TestimonialRouter);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
