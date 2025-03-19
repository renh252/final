import React, { useContext } from 'react';
import { EditorContext } from '../../context/EditorContext';

const SaveButton = () => {
  const { content, setContent } = useContext(EditorContext);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save the content');
      }

      const result = await response.json();
      alert('Content saved successfully: ' + result.message);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleSave}>
      Save
    </button>
  );
};

export default SaveButton;