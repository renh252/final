import { useEffect, useRef, useState } from 'react';
import E from 'wangeditor';

const useEditor = (initialContent = '') => {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const newEditor = new E(editorRef.current);
    
    newEditor.config.onchange = (newHtml) => {
      setContent(newHtml);
    };

    newEditor.config.customUploadImg = (resultFiles, insertImgFn) => {
      const formData = new FormData();
      formData.append('file', resultFiles[0]);

      fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          insertImgFn(data.url); // Assuming the API returns the image URL in the 'url' field
        })
        .catch((err) => {
          console.error('Image upload failed:', err);
        });
    };

    newEditor.create();
    setEditor(newEditor);

    return () => {
      newEditor.destroy();
    };
  }, []);

  return { editorRef, content, setContent };
};

export default useEditor;