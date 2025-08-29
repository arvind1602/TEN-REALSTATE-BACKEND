import express from "express";
//import mongoose from "mongoose";
import dotenv from "dotenv";
import ContactRouter from "./controllers/Contact.Controller.js";
import ProjectRouter from "./controllers/Projects.Controller.js";
import TestimonialRouter from "./controllers/Testimonial.Controller.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", ContactRouter, ProjectRouter, TestimonialRouter);
app.get("/", (req, res) => {
  res.send("server is running");
});
app.use("/uploads", express.static("uploads"));
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB atlas connected "))
//   .catch((err) => console.log(err));

// app.listen(5000, () => console.log("Server running on port 5000"));
export default app;