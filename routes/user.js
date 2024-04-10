const express = require("express");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const userRouter = express.Router();

const authorizationCheck = (req, res, next) => {
  const userRoles = req.users.role;
  console.log(userRoles);
  if (userRoles.includes("admin")) {
    next();
  } else {
    res.send("User khong co quyen");
  }
};

userRouter.get("/", authorizationCheck, async (req, res) => {
  try {
    const users = await userModel.find({});
    res.send(users);
  } catch (error) {
    res.send("Error");
    console.log(error);
  }
});

userRouter.get("/me", (req, res) => {
  res.send(req.user);
});

userRouter.get("/", authorizationCheck, async (req, res) => {
  const users = await userModel.find({});
  const user = req.user;
});

//check role user
userRouter.patch("/:email", authorizationCheck, async (req, res) => {
  const { role, song } = req.body;
  const email = req.params.email;
  const user = await userModel.findOne({ email });
  if (user) {
    const user = await userModel.findOneAndUpdate(
      { email },
      { $push: { songs: song } },
      { new: true }
    );
    res.send(user);
  } else {
    res.send("Khong co user");
  }
});

userRouter.post("/create", authorizationCheck, async () => {});

userRouter.delete("/:email", authorizationCheck, async (req, res) => {
  const email = req.params.email;
  const currentUser = req.user;
  if (currentUser.email === email) {
    res.status(400).send("Khong the xoa user nay");
    return;
  }
  const user = await userModel.findOne({ email });
  if (user) {
    await userModel.deleteOne({ email });
    res.send("Da xoa,");
  } else {
    res.send("Khong co user");
  }
});

userRouter.post("/profile", upload.any("avatar"), (req, res) => {
  console.log(req.file);
  res.send("ok");
});

module.exports = { userRouter };
