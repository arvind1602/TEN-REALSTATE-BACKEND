import Testimonial from "../models/Testimonial.Model.js";
import fs from "fs/promises";

export const createTestimonial = async (req, res) => {
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
};

export const getAllTestimonials = async (req, res) => {
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
};

export const getTestimonialById = async (req, res) => {
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
};

export const updateTestimonial = async (req, res) => {
  try {
    const { name, designation, rating, message } = req.body;
    const updateData = { name, designation, rating, message };

    const existing = await Testimonial.findById(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    if (req.file) {
      if (existing.portrait) {
        try {
          await fs.unlink(existing.portrait);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }
      updateData.portrait = req.file.path;
    }

    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.status(200).json({ success: true, testimonial: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    if (deleted.portrait) {
      try {
        await fs.unlink(deleted.portrait);
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }

    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
