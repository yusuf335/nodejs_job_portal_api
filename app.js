require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");

const app = express();
app.use(express.json());

// Importing all routes
const jobs = require("./router/jobs");

app.use("/api/v1", jobs);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Middleware to handle errors
app.use(errorMiddleware);

// Handling uncauth expection
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

/******* Database Connection ********************/
let server;
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    server = app.listen(8080);
    console.log("server connected");
  })
  .catch((err) => console.log(err));

// Handling Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});
