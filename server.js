const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { performance } = require("perf_hooks");

const app = express();
const port = process.env.PORT || 3000;

const cors = require("cors");
app.use(cors());

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

    const { width, height } = req.body; // Extract width and height from the request body

    if (!width || !height) {
      return res
        .status(400)
        .json({ error: "Please provide both width and height parameters." });
    }

    console.log("Started...");
    const start = performance.now();

    // Use Promise.all for parallel execution of image processing
    await Promise.all(
      files.map(async (file) => {
        const inputBuffer = file.buffer;
        const outputFilename = `${file.originalname}`;

        const resizedImageBuffer = await sharp(inputBuffer)
          .resize({
            width: parseInt(width), // Convert width to integer
            height: parseInt(height), // Convert height to integer
          })
          .toBuffer();

        // Set content disposition header to force browser to download the file
        res.set({
          "Content-Disposition": `attachment; filename="${outputFilename}"`,
          "Content-Type": "image/jpeg", // Change content type based on your image type
        });

        // Send resized image buffer as response
        res.send(resizedImageBuffer);
      })
    );

    const end = performance.now();
    console.log("Completed!");
    console.log("Total Time", end - start);
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
