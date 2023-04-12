import express from "express";
import Fuse from "fuse.js";
import fs from "fs";
import cors from "cors";

import { login, verifyToken } from "./auth.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const getResturantData = () => {
  const data = fs.readFileSync("./restaurants.json", "utf8");
  const parsed = JSON.parse(data);
  const results = parsed.map((item) => item.Name);
  return results;
};

const restaurants = getResturantData();
const restaurantsSet = new Set(restaurants);

const fuse = new Fuse(restaurants);

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  return res.json({ message: "Hello World" });
});

app.post("/login", (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: "Username or password is empty" });
  }
  try {
    const token = login(req.body.username, req.body.password);
    return res.status(200).json({ username: req.body.username, token });
  } catch (error) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

app.get("/suggestions", (req, res) => {
  const search = req.query.search;
  if (!search || search.length < 1) {
    return res
      .status(400)
      .json({ message: "Search query is empty or too short" });
  }
  const results = fuse.search(search, { limit: 4 });
  return res.status(200).json({ results });
});

app.get("/authenticate", verifyToken, (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

app.get("/validate", (req, res) => {
  const search = req.query.search;
  const valid = restaurantsSet.has(search);
  return res.status(200).json({ valid });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
