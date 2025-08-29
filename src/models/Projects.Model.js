import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String },
  location: { type: String, required: true },
  price: { type: String, required: true },
});
const Project = mongoose.model("Project", projectSchema);
export default Project;
