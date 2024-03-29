// ImageResize.worker.js

import { Image } from "image-js";

onmessage = async function (event) {
  const { imageNames } = event.data;
  const resizedImages = [];

  for (const imageName of imageNames) {
    try {
      const imageBuffer = await loadImage(imageName);
      const image = await Image.load(imageBuffer);
      const resizedImage = image.resize({ width: 300, height: 200 });
      const resizedImageData = resizedImage.toDataURL();

      // Post the resized image data back to the main thread
      postMessage({ imageName, resizedImageData });
    } catch (error) {
      console.error(`Error processing image ${imageName}: ${error.message}`);
    }
  }
};

async function loadImage(imageName) {
  const response = await fetch(`http://localhost:5000/upload/${imageName}`);
  const blob = await response.blob();
  return await blob.arrayBuffer();
}
