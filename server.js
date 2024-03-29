const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { performance } = require("perf_hooks");

const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "../frontEnd/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontEnd/build/index.html"));
});

app.post("/upload", upload.array("images"), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ error: "No images selected for uploading." });
    }

    const { width, height } = req.body; // Extract width and height from the request body

    if (!width || !height) {
      return res
        .status(400)
        .json({ error: "Please provide both width and height parameters." });
    }

    const outputDir = "output";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const resizedImages = [];

    console.log("Started...");
    const start = performance.now();

    // Use Promise.all for parallel execution of image processing
    await Promise.all(
      files.map(async (file) => {
        const inputBuffer = file.buffer;
        const outputFilename = `${file.originalname}`;
        const outputFile = path.join(__dirname, outputDir, outputFilename);

        await sharp(inputBuffer)
          .resize({
            width: parseInt(width), // Convert width to integer
            height: parseInt(height), // Convert height to integer
            // fit: "contain",
            // background: "red",
          })
          .toFile(outputFile);

        resizedImages.push(outputFilename);
      })
    );

    const end = performance.now();
    console.log("Completed!");
    console.log("Total Time", end - start);

    res.json({ resizedImages });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
