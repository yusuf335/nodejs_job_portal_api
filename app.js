const express = require("express");
const app = express();
const dotenv = require("dotenv");

// Setting up config.env file variable
dotenv.config({ path: "./config/config.env" });

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
