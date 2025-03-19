import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveContent = async () => {
    setIsSaving(true);
    // Add your save logic here, e.g., API call to save the content
    // After saving, you can reset the editor content if needed
    setIsSaving(false);
  };

  return (
    <EditorContext.Provider value={{ editorContent, setEditorContent, isSaving, saveContent }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  return useContext(EditorContext);
};