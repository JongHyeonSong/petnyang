const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

app.use(cors());
app.use(express.static(path.join(__dirname, "static")));

app.get("/ping", (req, res) => {
  res.send("pong")
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})