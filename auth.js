import jwt from "jsonwebtoken";
import fs from "fs";

const jwtSecret = process.env.JWT_SECTER || "secret";

const userData = fs.readFileSync("./users.json", "utf8");
const users = JSON.parse(userData);

export const login = (username, password) => {
  // check if username and password are correct
  const user = users.find((user) => user.username === username);
  if (!user) {
    throw new Error("Invalid username or password");
  } else if (user.password !== password) {
    throw new Error("Invalid username or password");
  }
  const token = jwt.sign({ username }, jwtSecret, {
    expiresIn: "1h",
  });

  return token;
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
