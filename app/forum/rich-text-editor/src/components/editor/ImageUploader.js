import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url) {
        onUpload(response.data.url);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={loading}
      />
      {loading && <p>Uploading...</p>}
    </div>
  );
};

export default ImageUploader;