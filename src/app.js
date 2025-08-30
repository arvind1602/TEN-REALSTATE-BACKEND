import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import router
import UserRouter from "./routes/User.Router.js";
import ContactUsRouter from "./routes/Contact.Router.js";
import projectRouter from "./routes/Projects.Router.js";
import testimonialRouter from "./routes/Testimonial.Router.js";

//define router
app.use("/api/users", UserRouter);
app.use("/api", ContactUsRouter);
app.use("/api/projects", projectRouter);
app.use("/api/testimonials", testimonialRouter);

export default app;
