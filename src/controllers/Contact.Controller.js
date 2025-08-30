import Contact from "../models/Contact.Model.js";

const ContactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!email || !name || !message) {
      return res.status(400).json({ msg: "all fields are required" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(200).json({ msg: "Contact form submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export default ContactUs;

//import express from "express";
// const router = express.Router();

// router.post("/contact", async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     if (!email || !name || !message) {
//       return res.status(400).json({ msg: "all fields are required" });
//     }

//     const newContact = new Contact({ name, email, message });
//     await newContact.save();

//     res.status(200).json({ msg: "Contact form submitted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });
