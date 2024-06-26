require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user/user");
const jwt = require("jsonwebtoken");
const { users, userModel } = require("./models/user");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { teamRouter } = require("./routes/team/team");

const app = express();

const url = process.env.MONGO_URL;
mongoose.connect(url, {
  autoIndex: true,
});
const db = mongoose.connection;
db.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.use(express.json());
app.use(cors());

const authenticationCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "123@lol");
    const { email } = decoded;
    const user = await userModel.findOne({ email: email });
    if (user) {
      req.user = user;
      next();
    } else {
      res.send("User khong ton tai");
    }
  } catch (error) {
    res.status(401).send("Token expires");
    console.log(error);
  }
};

app.use("/users", authenticationCheck, userRouter);
app.use("/teams", authenticationCheck, teamRouter);

app.get("/", (req, res) => {
  res.send("Run on Vercel");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (user && bcrypt.compareSync(password, user.password)) {
    const accesstoken = jwt.sign({ email: email }, "123@lol");
    res.send({ token: accesstoken });
  } else {
    res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
  }
});

app.listen(8000, () => console.log("Run on port 8000"));
console.log("Server running");
module.exports = app;
