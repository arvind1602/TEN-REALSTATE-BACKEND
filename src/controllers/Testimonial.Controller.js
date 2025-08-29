import express from "express";
import Testimonial from "../models/Testimonial.Model.js";
import upload from "../middlewares/multer.js";
import fs from "fs";

const router = express.Router();

// Create testimonial with image upload
router.post("/testimonial", upload.single("portrait"), async (req, res) => {
  try {
    const { name, designation, rating, message } = req.body;
    const portrait = req.file ? req.file.path : null;

    const newTestimonial = new Testimonial({
      name,
      designation,
      portrait,
      rating,
      message,
    });

    await newTestimonial.save();
    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all testimonials
router.get("/testimonial", async (req, res) => {
  try {
    const data = await Testimonial.find().lean();
    const testimonials = data.map((t) => ({
      ...t,
      stars: "⭐".repeat(t.rating),
    }));
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single testimonial
router.get("/testimonial/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.status(200).json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update testimonial (with optional image update)
router.put("/testimonial/:id", upload.single("portrait"), async (req, res) => {
  try {
    const { name, designation, rating, message } = req.body;
    const updateData = { name, designation, rating, message };

    if (req.file) {
      const existing = await Testimonial.findById(req.params.id);
      if (existing?.portrait) {
        fs.unlink(existing.portrait, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
      updateData.portrait = req.file.path;
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.status(200).json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete testimonial
router.delete("/testimonial/:id", async (req, res) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    if (deleted.portrait) {
      fs.unlink(deleted.portrait, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }

    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
