const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel } = require("../models/user");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const userRouter = express.Router();

const authorizationCheck = (req, res, next) => {
  const userRoles = req.user.role;
  console.log(userRoles);
  if (userRoles.includes("admin")) {
    next();
  } else {
    res.send("User không có quyền");
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

userRouter.put("/:id", authorizationCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password, phone } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          fullname: fullname,
          email: email,
          password: password,
          phone: phone,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`User ${id} updated successfully.`);
      console.log(`New data: `, updatedUser);
      res.send(updatedUser);
    } else {
      console.log(`User with ID ${id} not found.`);
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log("Error during record update: ", error);
    res.status(500).send("Error during record update");
  }
});
userRouter.put("/:id", authorizationCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, phone } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          fullname: fullname,
          email: email,
          phone: phone,
        },
      },
      { new: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("Error during record update");
  }
});

userRouter.patch("/:email", authorizationCheck, async (req, res) => {
  const { role, song } = req.body;
  const email = req.params.email;
  const user = await userModel.findOne({ email });
  if (user) {
    const updatedUser = await userModel.findOneAndUpdate({ email });
    res.send(updatedUser);
  } else {
    res.send("Không có người dùng");
  }
});
userRouter.get("/users", authorizationCheck, async (req, res) => {
  try {
    const users = await userModel.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send("Lỗi khi lấy danh sách người dùng");
    console.error(error);
  }
});

userRouter.get("/role", (req, res) => {
  const userRole = req.user.role;
  res.send({ role: userRole });
});

userRouter.post("/create", authorizationCheck, async (req, res) => {
  const { fullname, birthday, email, password, phone } = req.body;
  const existringUser = await userModel.findOne({ email });
  if (existringUser) {
    res.status(401).json({ message: "Học sinh đã tồn tại" });
  } else {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = await userModel.create({
      fullname,
      birthday,
      email,
      password: hashPassword,
      phone,
      role: ["stu"],
    });
    res.send(user);
  }
});

userRouter.delete("/:id", authorizationCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const userDelete = await userModel.findOneAndDelete({ _id: id });

    if (userDelete) {
      res.send("Đã xóa");
    } else {
      res.send("Không có user");
    }
  } catch (error) {
    res.status(500).send("Lỗi khi xóa user");
  }
});

userRouter.post("/profile", upload.any("avatar"), (req, res) => {
  console.log(req.file);
  res.send("ok");
});

userRouter.get("/:id", authorizationCheck, async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send("The user with the given ID was not found.");
    }
    res.send(user);
  } catch (error) {
    res.status(500).send("Error fetching user data.");
  }
});

module.exports = { userRouter };
