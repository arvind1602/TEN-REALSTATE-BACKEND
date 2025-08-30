import { Router } from "express";
import ContactUs from "../controllers/Contact.Controller.js";

const router = Router();

router.post("/contact", ContactUs);

export default router;
