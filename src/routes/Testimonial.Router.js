import express from "express";
import upload from "../middlewares/multer.js";
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/Testimonial.Controller.js";

const router = express.Router();

router.post("/", upload.single("portrait"), createTestimonial);
router.get("/", getAllTestimonials);
router.get("/:id", getTestimonialById);
router.put("/:id", upload.single("portrait"), updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
