// controllers/Projects.controller.js

import Project from "../models/Projects.Model.js";

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Add a new project
export const addProject = async (req, res) => {
  try {
    const { name, location, price, description } = req.body;

    if (!name || !location || !price || !description == null) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const newProject = new Project({ name, location, price, description });
    await newProject.save();

    res.status(201).json({
      msg: "Project added successfully",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Search projects by name, location, or price
export const searchProjects = async (req, res) => {
  try {
    const key = req.params.key;
    const priceQuery = parseFloat(key);

    const query = {
      $or: [
        { name: { $regex: key, $options: "i" } },
        { location: { $regex: key, $options: "i" } },
      ],
    };

    if (!isNaN(priceQuery)) {
      query.$or.push({ price: priceQuery });
    }

    const projects = await Project.find(query);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
