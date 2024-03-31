const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user");
const jwt = require("jsonwebtoken");
const { users, userModel } = require("./models/user");
const bcrypt = require("bcrypt");
// const { songRouter } = require("./routes/song");
const cors = require("cors");

const app = express();

// mongoose.connect('mongodb://0.0.0.0:27017/mindx')
mongoose.connect(
  "mongodb+srv://long:ngchaulong@cluster0.duee8k1.mongodb.net/mindx"
);

app.use(express.json());
app.use(cors());

// app.options('*', (req, res) => {
//     res.header({ 'Access-Control-Allow-Origin': '*' })
//     res.sendStatus(204)
// })

const authenticationCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "123@lol");
    const { username } = decoded;
    // Check user co trong co so du lieu khong
    const user = await userModel
      .findOne({ username: username })
      // .populate("songs");
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
// app.use("/songs", authenticationCheck, songRouter);

app.get("/", (req, res) => {
  res.send("Home router");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //check trong db
  const user = await userModel.findOne({ username });
  //nếu có user thì trả token , còn không thì trả lỗi
  if (user && bcrypt.compareSync(password, user.password)) {
    const accesstoken = jwt.sign({ username: username }, "123@lol");
    // Tra token cho client
    res.send({ token: accesstoken });
  } else {
    res.send("khong tim thay");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // check trùng username trong db
  const existringUser = await userModel.findOne({ username });
  // nếu trùng thì không cho tạo , nếu không trùng thì tạo user
  // tim user có usename == req.body.username
  // nếu tồn tại thì res.send('user da ton tại )
  // nếu ko thì create
  if (existringUser) {
    res.send("user ton tại");
  } else {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = await userModel.create({
      username,
      password: hashPassword,
      role: ["admin"],
    });
    res.send(user);
  }
});

app.put("/update", async (req, res) => {
  const { username, password } = res.body;
});

app.listen(3000);
console.log("Server running");
module.exports = app;
