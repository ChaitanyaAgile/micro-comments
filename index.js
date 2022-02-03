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
  comments.push({ id: commentId, content, status: "pending" });
  axios
    .post("http://e-bus-service:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    })
    .catch((err) => console.log(err));
  commentsByPostId[req.params.id] = comments;
});

app.post("/events", (req, res) => {
  console.log("Recieved Event:", req.body.type);
  const { type, data } = req.body;
  if (type === "CommentModerated") {
    const { id, postId, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((c) => {
      return c.id === id;
    });
    // we are not pushing change to array because
    // we are already mutating the original object
    comment.status = status;
    axios
      .post("http://e-bus-service:4005/events", {
        type: "CommentUpdated",
        data,
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  res.send({});
});

app.listen(4001, () => {
  console.log("listening on 4001");
});
