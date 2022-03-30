const express = require("express");

const {
  upload,
  getById,
  deleteById,
} = require("../controller/upload.controller");

const router = express.Router();

router.post("/upload", upload);

router.get("/upload/:id", getById);

router.delete("/upload/:id", deleteById);

module.exports = router;
