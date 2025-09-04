// routes/Projects.routes.js

import express from "express";
import {
  getAllProjects,
  addProject,
  getProjectById,
  searchProjects,
  updateProject,
} from "../controllers/Projects.Controller.js";

const router = express.Router();
router.put("/:id", updateProject);
// Base path: /api/projects
router.get("/", getAllProjects); // GET /api/projects
router.post("/", addProject); // POST /api/projects
router.get("/search/:key", searchProjects); // GET /api/projects/search/:key
router.get("/:id", getProjectById); // GET /api/projects/:id

export default router;
