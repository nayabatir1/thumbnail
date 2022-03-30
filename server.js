const express = require("express");
const mongoose = require("mongoose");
const { config } = require("dotenv");

config();

const routes = require("./routes");

const app = express();

app.use("/public", express.static("public"));

app.use("/", routes);

app.use((_req, res) => {
  res.status(401).send("NOT FOUND! 🤷‍♂️");
});

const PORT = 3000;
const { MONGODB_URL, DATABASE_NAME } = process.env;

mongoose
  .connect(MONGODB_URL.replace("DATABASE_NAME", DATABASE_NAME))
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, () => {
      console.log(`server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(chalk.bgRed.black(error.message));
    process.exit(1);
  });
