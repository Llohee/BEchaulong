const express = require("express");
const { teamModel } = require("../../models/team");
const multer = require("multer");
const { userModel } = require("../../models/user");
const upload = multer({ dest: "uploads/" });

const teamRouter = express.Router();

teamRouter.get("/", async (req, res) => {
  try {
    const teams = await teamModel.find({}).select("_id name");
    res.send(teams);
  } catch (error) {
    res.status(500).send("Error");
    console.log(error);
  }
});

teamRouter.post("/create", async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user;
    console.log(req.user);
    const existingTeam = await teamModel.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ error: "Team name already exists" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const team = await teamModel.create({
      name,
      description,
      created_by: createdBy,
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

teamRouter.post("/:teamId/add-users", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !Array.isArray(id)) {
      return res.status(400).json({ error: "id array is missing or invalid" });
    }
    const { teamId } = req.params;
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    for (const userId of id) {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: `User with ID ${userId} - ${user.fullname} not found`,
        });
      }
      if (team.users.includes(userId)) {
        return res.status(400).json({
          error: `User with ID ${userId} - ${user.fullname} is already in team`,
          message: `Thành viên ${user.fullname} đã ở trong nhóm`,
        });
      }
      team.users.push(userId);
    }
    await team.save();
    res.status(200).json({ message: "Đã thêm thành công thành viên" });
  } catch (error) {
    console.error("Error adding users to team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//Get team by UserId
teamRouter.get("/team/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    const user = await userModel.findById(userId);
    console.log(user);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const teams = await teamModel.find({ users: userId });
    return res.status(200).json({ user, teams });
  } catch (error) {
    console.error("Error finding teams for user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

teamRouter.get("/:id", async (req, res) => {
  try {
    const team = await teamModel.findById(req.params.id);
    if (!team) {
      return res.status(404).send("The team with the given ID was not found.");
    }
    res.send(team);
  } catch (error) {
    res.status(500).send("Error fetching team data.");
  }
});

module.exports = { teamRouter };
