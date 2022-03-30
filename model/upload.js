const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const schema = new Schema(
  {
    file: String,
    thumbnail: Object,
    size: Number,
    name: String,
  },
  { timestamps: true }
);

module.exports = model("upload", schema);
