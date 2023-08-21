require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Importing all routes
const jobs = require("./router/jobs");

app.use("/api/v1", jobs);

/******* Database Connection ********************/
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(8080);
    console.log("server connected");
  })
  .catch((err) => console.log(err));
