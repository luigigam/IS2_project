require("dotenv").config();

const express = require("express");
const router = express.Router();
const Seller = require("../models/seller");
const hashing = require("../middlewares/encrypt_pssw");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Getting all
router.get("/", async (req, res) => {
  const sellers = await Seller.find();
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Getting one
router.get("/:id", getSeller, (req, res) => {
  res.send(res.seller);
});
// Creating one
router.post("/", async (req, res) => {
  const tmp = await Seller.findOne({ username: req.body.username });
  if (tmp == null) {
    const hashed = await hashing(req.body.password);
    const seller = new Seller({
      username: req.body.username,
      password: hashed,
      email: req.body.email,
      business_name: req.body.business_name,
      adress: req.body.adress,
      phone_number: req.body.phone_number,
    });
    try {
      const newSeller = await seller.save();
      res.status(201).json(newSeller);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(409).json('Username already in use');
  }
});
// Updating one
router.patch("/:id", getSeller, async (req, res) => {
  if (req.body.username != null) {
    res.seller.username = req.body.username;
  }
  if (req.body.password != null) {
    res.seller.password = req.body.password;
  }
  if (req.body.email != null) {
    res.seller.email = req.body.email;
  }
  if (req.body.business_name != null) {
    res.seller.business_name = req.body.business_name;
  }
  if (req.body.adress != null) {
    res.seller.adress = req.body.adress;
  }
  if (req.body.phone_number != null) {
    res.seller.phone_number = req.body.phone_number;
  }
  try {
    const updatedSeller = await res.seller.save();
    res.json(updatedSeller);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deleting one
router.delete("/:id", getSeller, async (req, res) => {
  try {
    await res.seller.remove();
    res.json({ message: "Deleted Seller" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login authentication
router.post("/login", async (req, res) => {
  const seller = await Seller.findOne({ username: req.body.username });
  if (seller == null) {
    return res.status(400).send("Cannot find seller");
  }
  try {
    if (await bcrypt.compare(req.body.password, seller.password)) {
      const accessToken = jwt.sign(
        seller.toJSON(),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.json({ accessToken: accessToken });
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

async function getSeller(req, res, next) {
  let seller;
  try {
    seller = await Seller.findById(req.params.id);
    if (seller == null) {
      return res.status(404).json({ message: "Cannot find seller" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.seller = seller;
  next();
}

module.exports = getSeller;
module.exports = router;
