const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const JSZip = require("jszip");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.array("images"), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ error: "No images selected for uploading." });
    }

    const { width, height } = req.body;

    if (!width || !height) {
      return res
        .status(400)
        .json({ error: "Please provide both width and height parameters." });
    }

    const zip = new JSZip();
    const promises = [];

    files.forEach((file) => {
      const outputFilename = `${file.originalname}`;
      const inputBuffer = file.buffer;

      const resizedImagePromise = sharp(inputBuffer)
        .resize({
          width: parseInt(width),
          height: parseInt(height),
          fit: sharp.fit.cover,
        })
        .toBuffer()
        .then((resizedBuffer) => {
          zip.file(outputFilename, resizedBuffer);
        });

      promises.push(resizedImagePromise);
    });

    await Promise.all(promises);

    const zipData = await zip.generateAsync({ type: "nodebuffer" });

    res.set("Content-Type", "application/zip");
    res.set("Content-Disposition", "attachment; filename=resized_images.zip");
    res.send(zipData);
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
