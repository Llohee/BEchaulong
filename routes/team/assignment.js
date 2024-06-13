const express = require("express");
const { teamModel } = require("../../models/team");
const multer = require("multer");
const { userModel } = require("../../models/user");
const upload = multer({ dest: "uploads/" });

const assignmentRouter = express.Router();
//create Assignment
assignmentRouter.post("/:teamId/add-homework", async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, start_time, end_time, image } = req.body;
    if (!name || !start_time || !end_time) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    const newHomework = {
      name,
      description,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      image,
      is_active:
        new Date(start_time) <= new Date() && new Date() <= new Date(end_time)
          ? "true"
          : "false",
    };
    team.homework.push(newHomework);
    await team.save();
    res
      .status(200)
      .json({ message: "Homework added to team successfully", team });
  } catch (error) {
    console.error("Error adding homework to team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//get active Assigment
assignmentRouter.get("/:teamId/active-homeworks", async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    const activeHomeworks = team.homework.filter(
      (hw) => hw.is_active === "true"
    );
    res.status(200).json({ activeHomeworks });
  } catch (error) {
    console.error("Error fetching active homeworks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//get inactive Assigment
assignmentRouter.get("/:teamId/inactive-homeworks", async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    const inactiveHomeworks = team.homework.filter(
      (hw) => hw.is_active === "false"
    );
    res.status(200).json({ inactiveHomeworks });
  } catch (error) {
    console.error("Error fetching active homeworks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//Submit Assigment
assignmentRouter.post(
  "/:teamId/:homeworkId/submit",
  upload.single("image"),
  async (req, res) => {
    try {
      const { teamId, homeworkId } = req.params;
      const userId = req.user._id;
      const { score, description } = req.body;
      const image = req.file ? req.file.path : null;

      const team = await teamModel.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const homework = team.homework.id(homeworkId);
      if (!homework) {
        return res.status(404).json({ error: "Homework not found" });
      }

      const userAlreadySubmitted = homework.submitted_users.some(
        (submission) => submission.user.toString() === userId.toString()
      );

      if (userAlreadySubmitted) {
        return res
          .status(400)
          .json({ error: "User has already submitted this homework" });
      }

      const submission = {
        user: userId,
        description,
        image,
        score: null,
        submitted_time: new Date(),
      };

      homework.submitted_users.push(submission);
      await team.save();
      res
        .status(200)
        .json({ message: "Homework submitted successfully", team });
    } catch (error) {
      console.error("Error submitting homework:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//Get user submisstion
assignmentRouter.get(
  "/:teamId/homework/:homeworkId/submissions",
  async (req, res) => {
    try {
      const { teamId, homeworkId } = req.params;

      const team = await teamModel.findById(teamId).populate({
        path: "users",
        select: "fullname email", // Chọn các trường fullname và email từ mô hình user
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const homework = team.homework.id(homeworkId);
      if (!homework) {
        return res.status(404).json({ error: "Homework not found" });
      }

      const submissions = homework.submitted_users.map((submission) => ({
        user: team.users.find(
          (user) => user._id.toString() === submission.user.toString()
        ),
        description: submission.description,
        score: submission.score,
        submitted_time: submission.submitted_time,
      }));

      const submittedUserIds = submissions.map((submission) =>
        submission.user._id.toString()
      );

      const usersNotSubmitted = team.users.filter(
        (user) => !submittedUserIds.includes(user._id.toString())
      );

      res.status(200).json({ submissions, usersNotSubmitted });
    } catch (error) {
      console.error("Error fetching homework submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
//Getsubmisstion
assignmentRouter.get("/:teamId/submissions/:userId", async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const homeworks = team.homework.filter((homework) =>
      homework.submitted_users.some(
        (submission) => submission.user.toString() === userId
      )
    );

    if (homeworks.length === 0) {
      return res
        .status(404)
        .json({ error: "No submissions found for this user in this team" });
    }

    let submissions = [];
    homeworks.forEach((homework) => {
      const submittedUser = homework.submitted_users.find(
        (submission) => submission.user.toString() === userId
      );
      if (submittedUser) {
        submissions.push({
          homeworkId: homework._id,
          homeworkName: homework.name,
          description: submittedUser.description,
          image: submittedUser.image,
          score: submittedUser.score,
          submitted_time: submittedUser.submitted_time,
        });
      }
    });

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching user submissions in team:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//Get Assignment by Id
assignmentRouter.get("/:teamId/homework/:homeworkId", async (req, res) => {
  try {
    const { teamId, homeworkId } = req.params;
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    const homework = team.homework.id(homeworkId);
    if (!homework) {
      return res.status(404).json({ error: "Homework not found" });
    }
    res.status(200).json({ homework });
  } catch (error) {
    console.error("Error fetching homework by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Delete submission
assignmentRouter.delete(
  "/:teamId/:homeworkId/delete-submission/:submissionId",
  async (req, res) => {
    try {
      const { teamId, homeworkId, submissionId } = req.params;
      const userId = req.user._id;

      const team = await teamModel.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const homework = team.homework.id(homeworkId);
      if (!homework) {
        return res.status(404).json({ error: "Homework not found" });
      }

      const submissionIndex = homework.submitted_users.findIndex(
        (submission) =>
          submission._id.toString() === submissionId.toString() &&
          submission.user.toString() === userId.toString()
      );

      // if (submissionIndex === -1) {
      //   return res
      //     .status(400)
      //     .json({ error: "Submission not found or not authorized to delete" });
      // }

      homework.submitted_users.splice(submissionIndex, 1);
      await team.save();

      res.status(200).json({ message: "Submission deleted successfully" });
    } catch (error) {
      console.error("Error deleting submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
module.exports = { assignmentRouter };
