import Project from "../models/Projects.Model.js";
import express from "express";
import auth from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/projects", auth, async (req, res) => {
  try {
    const { name, location, price } = req.body;
    if (!name || !location || !price) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const newProject = new Project({ name, location, price });
    await newProject.save();
    res
      .status(201)
      .json({ msg: "Project added successfully", project: newProject });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.get("/projects/search/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const projects = await Project.find({
      $or: [
        { name: { $regex: key, $options: "i" } },
        { location: { $regex: key, $options: "i" } },
        { price: { $regex: key, $options: "i" } },
      ],
    });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
