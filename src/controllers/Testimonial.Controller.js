import express from "express";
import Testimonial from "../models/Testimonial.Model.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/testimonial", upload.single("portrait"), async (req, res) => {
  try {
    const { name, designation, rating, message } = req.body;
    const newTestimonial = new Testimonial({
      name,
      designation,
      portrait: req.file ? req.file.path : null,
      rating,
      message,
    });
    await newTestimonial.save();
    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/testimonial", async (req, res) => {
  try {
    const data = await Testimonial.find();
    const testimonials = data.map((t) => ({
      ...t._doc,
      stars: "⭐".repeat(t.rating),
    }));
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/testimonial/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/testimonial/:id", async (req, res) => {
  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTestimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/testimonial/:id", async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTestimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
