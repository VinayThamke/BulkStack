// src/ImageUpload.js

import React, { useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [resizedImages, setResizedImages] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedImages(event.target.files);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      for (const image of selectedImages) {
        formData.append("images", image);
      }

      const response = await axios.post(
        "http://localhost:5000/upload",
        formData
      );

      if (response.status === 200) {
        setResizedImages(response.data.resizedImages);
      } else {
        setError("Failed to upload images");
      }
    } catch (error) {
      setError(`Error uploading images: ${error.message}`);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} multiple />
      <button onClick={handleUpload}>Resize</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resizedImages.length > 0 && (
        <div>
          <h2>Resized Images:</h2>
          <ul>
            {resizedImages.map((imageName) => (
              <li key={imageName}>{imageName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
