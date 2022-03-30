const { IncomingForm } = require("formidable");
const { randomUUID } = require("crypto");
const { unlinkSync, existsSync } = require("fs");

const Upload = require("../model/upload");
const thumbnail = require("../helper/wokrer");

const thumbnailDim = [100, 200, 300, 400];

const mimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/x-m4v",
  "video/quicktime",
];

const options = {
  uploadDir: "./public/upload",
  keepExtensions: true,
  maxFileSize: 30 * 1024 * 1024,
  maxFields: 1,
  allowEmptyFiles: false,
  multiples: true,
  filename: (_name, _ext, part, _form) =>
    `${randomUUID()}.${part.mimetype.split("/")[1]}`,
  filter: ({ mimetype }) => mimetype && mimeTypes.includes(mimetype),
};

module.exports.upload = (req, res) => {
  const form = new IncomingForm(options);
  const filePaths = [];
  const files = [];

  form.parse(req);

  form.once("error", (err) => {
    filePaths.forEach((i) => {
      unlinkSync(i);
    });

    res.status(err.httpCode).json(response({ message: status[err.httpCode] }));
  });

  form.on("file", (formname, file) => {
    const absolutePath = "localhost:3000/public/upload/";
    const thumbnail = {};

    thumbnailDim.forEach((i) => {
      thumbnail[i] = absolutePath + i + file.newFilename.split(".")[0] + ".png";
    });

    const obj = {
      name: file.newFilename,
      file: absolutePath + file.newFilename,
      mimetype: file.mimetype,
      size: file.size,
      thumbnail,
      path: "./public/upload/" + file.newFilename,
    };
    files.push(obj);
  });

  form.on("fileBegin", (formname, file) => {
    filePaths.push(file.filepath);
  });

  form.once("end", async () => {
    const ids = await Upload.bulkWrite(
      files.map((i) => ({ insertOne: { document: i } }))
    );

    thumbnail(files);

    res.status(201).json({ ids: ids.result.insertedIds.map((i) => i._id) });
  });
};

module.exports.getById = async (req, res) => {
  const data = await Upload.findOne({ _id: req.params.id });

  res.status(200).json(data);
};

module.exports.deleteById = async (req, res) => {
  const data = await Upload.findOneAndDelete({ _id: req.params.id });

  let path = getFilePath(data.file);
  existsSync(path) && unlinkSync(path);

  for (let i in data.thumbnail) {
    path = getFilePath(data.thumbnail[i]);
    existsSync(path) && unlinkSync(path);
  }

  res.status(204).send();
};

const getFilePath = (url) => {
  const temp = url.split("public")[1];

  return `./public${temp}`;
};
