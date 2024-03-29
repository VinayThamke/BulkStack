import React, { useState } from "react";
import axios from "axios";
import JSZip from "jszip";

const ImageUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedImages(event.target.files);
  };

  const handleWidthChange = (event) => {
    setWidth(event.target.value);
  };

  const handleHeightChange = (event) => {
    setHeight(event.target.value);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      for (const image of selectedImages) {
        formData.append("images", image);
      }
      formData.append("width", width);
      formData.append("height", height);

      const response = await axios.post(
        "https://calm-pink-sea-urchin-kilt.cyclic.app/upload",
        formData,
        {
          responseType: "arraybuffer", // Ensure response is treated as a binary buffer
        }
      );

      // Create a new JSZip instance for the main ZIP file
      const zip = new JSZip();

      // Convert binary response data to Uint8Array
      const dataArray = new Uint8Array(response.data);

      // Read each image file and add it to the ZIP
      const promises = Array.from(selectedImages).map((image, index) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const outputFilename = image.name;
            zip.file(outputFilename, event.target.result);
            resolve();
          };
          reader.readAsArrayBuffer(image);
        });
      });

      // Wait for all promises to resolve before generating the ZIP
      await Promise.all(promises);

      // Generate the content of the main ZIP as a blob
      const blob = await zip.generateAsync({ type: "blob" });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = url;

      // Set the filename for the downloaded file
      link.setAttribute("download", "resized_images.zip");

      // Append the link to the document body
      document.body.appendChild(link);

      // Programmatically trigger the download
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);

      // Remove the link from the document body
      document.body.removeChild(link);
    } catch (error) {
      setError(`Error uploading images: ${error.message}`);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} multiple />
      <input
        type="text"
        placeholder="Width"
        value={width}
        onChange={handleWidthChange}
      />
      <input
        type="text"
        placeholder="Height"
        value={height}
        onChange={handleHeightChange}
      />
      <button onClick={handleUpload}>Upload</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ImageUpload;
