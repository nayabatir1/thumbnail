const {
  Worker,
  isMainThread,
  workerData,
  parentPort,
} = require("worker_threads");
const fs = require("fs");
const path = require("path");

const threads = new Set();
let tasks = [];

if (isMainThread) {
  module.exports = (files) => {
    const temp = files.filter((i) => i.mimetype.includes("image"));

    if (!temp.length) return;

    tasks = tasks.concat(files);

    threads.size || (tasks.length && assignTask());
  };
} else {
  const Jimp = require("jimp");
  const FFmpeg = require("ffmpeg");

  const { task, size } = workerData;

  Jimp.read("./public/image/watermark.png")
    .then((i) => i.resize(size, Jimp.AUTO).fade(0.8))
    .then((t) => {
      Jimp.read(task.path).then((i) =>
        i
          .contain(size, size)
          .quality(60)
          .composite(
            t,
            size / 2 - t.getWidth() / 2,
            size / 2 - t.getHeight() / 2
          )
          .write("./public/upload/" + size + task.name.split(".")[0] + ".png")
      );
    });
}

const assignTask = () => {
  const temp = tasks.pop();

  if (temp.mimetype.includes("image")) {
    Object.keys(temp.thumbnail).forEach((key) => {
      threads.add(
        new Worker(__filename, { workerData: { task: temp, size: +key } })
      );
      console.log(`Thread started, ${threads.size}`);
    });
  }

  for (const worker of threads) {
    worker.on("error", (err) => {
      console.error(err);
    });
    worker.on("message", (t) => {
      tasks.push(t);
    });
    worker.on("exit", () => {
      console.log(`Thread exiting, ${threads.size}`);
      threads.delete(worker);

      threads.size || (tasks.length && assignTask());
    });
  }
};
