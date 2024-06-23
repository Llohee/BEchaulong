const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel } = require("../../models/user");
const multer = require("multer");
const { authorizationCheck } = require("./author");
const { default: mongoose } = require("mongoose");
const upload = multer({ dest: "uploads/" });

const userRouter = express.Router();

userRouter.get("/", authorizationCheck, async (req, res) => {
  try {
    const users = await userModel.find({});
    res.send(users);
  } catch (error) {
    res.send("Error");
    console.log(error);
  }
});

userRouter.get("/me", async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel
      .findById(userId)
      .populate("updated_by", "fullname");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user information:", error);
    res
      .status(500)
      .json({
        message: "Error retrieving user information",
        error: error.message,
      });
  }
});

userRouter.put("/:id", authorizationCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, address, school, code } = req.body;
    const updatedBy = req.user._id;
    const userRole = req.user.role;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          email: email,
          address: address,
          phone: phone,
          school: school,
          code: code,
          updated_date: Date.now(),
          updated_by: updatedBy,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      return res
        .status(200)
        .json({ message: "Cập nhật học sinh thành công!", user: updatedUser });
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error during record update:", error);
    return res
      .status(500)
      .json({ message: "Error during record update", error: error.message });
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
  const { fullname, birthday, email, password, phone, code, school, address } =
    req.body;
  const updatedBy = req.user._id;

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(401).json({ message: "Học sinh đã tồn tại" });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = await userModel.create({
      fullname,
      email,
      password: hashPassword,
      phone,
      code,
      school,
      address,
      birthday,
      role: ["stu"],
      created_date: Date.now(),
      updated_by: updatedBy,
    });

    return res
      .status(201)
      .json({ message: "Tạo mới học sinh thành công!", user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Lỗi khi tạo học sinh" });
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

userRouter.get("/:id", authorizationCheck, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel
      .findById(userId)
      .populate("updated_by", "fullname");

    if (!user) {
      return res.status(404).send("The user with the given ID was not found.");
    }

    res.send(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Error fetching user data.");
  }
});

module.exports = { userRouter };
