const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const { default: axios } = require("axios");
const app = express();

const commentsByPostId = {};

app.use(cors());
app.use(express.json());

app.get("/posts/:id/comments", (req, res) => {
  const comments = commentsByPostId[req.params.id] || [];
  res.send(comments);
});

app.post("/posts/:id/comments", (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  axios
    .post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: { id: commentId, content, postId: req.params.id },
    })
    .catch((err) => console.log(err));
  comments.push({ id: commentId, content });
  commentsByPostId[req.params.id] = comments;
});

app.post("/events", (req, res) => {
  console.log("Recieved Event:", req.body.type);
  res.send({});
});

app.listen(4001, () => {
  console.log("listening on 4001");
});
