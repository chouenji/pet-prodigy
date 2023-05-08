// Avoids typescript from making global modules
export {};

// Import dependencies
const express = require("express");
const bcrypt = require("bcrypt");

const Comment = require("../models/comment");
const User = require("../models/user");
const { authenticateToken } = require("../middlewares/authentication");

// Create router
const router = express.Router();

// @route   Get /api/comments
// @access  Public
// @desc    Get a list of all comments
router.get("/", async (req: any, res: any) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
});

// @route   Get /api/comments/:id
// @access  Public
// @desc    Get a comment, not implemented yet
router.get("/:id", getComment, (req: any, res: any) => {
  res.json(res.comment);
});

// @route   POST /api/comments
// @access  Private
// @desc    POST a comment
router.post("/", authenticateToken, async (req: any, res: any) => {
  const user = await User.findById(req.body.id);
  const username = user.username;
  const comment = new Comment({
    userId: user._id,
    comment: req.body.comment,
  });
  try {
    const newComment = await comment.save();
    delete newComment._doc["__v"];
    res.status(201).json({ ...newComment._doc, username });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    }
  }
});

// @route   DELETE /api/comments/:id
// @access  Private
// @desc    Delete a comment
router.delete("/:id", getComment, async (req: any, res: any) => {
  try {
    await res.comment.remove();
    res.json({ message: "Deleted comment" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
});

// Middleware function to get comment by id
async function getComment(req: any, res: any, next: any) {
  let comment;
  try {
    await Comment.findById(req.params.id);
    if (comment == null) {
      return res.status(400).json({ message: "Cannot find comment" });
    }
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.comment = comment;
  next();
}

module.exports = router;
