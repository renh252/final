import React, { useEffect, useRef, useContext } from 'react';
import E from 'wangeditor';
import { EditorContext } from '../../context/EditorContext';

const RichTextEditor = () => {
  const editorRef = useRef(null);
  const { editorContent, setEditorContent } = useContext(EditorContext);

  useEffect(() => {
    const editor = new E(editorRef.current);
    
    editor.config.onchange = (html) => {
      setEditorContent(html);
    };

    editor.config.customUploadImg = (resultFiles, insertImgFn) => {
      const formData = new FormData();
      formData.append('file', resultFiles[0]);

      fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        insertImgFn(data.url);
      })
      .catch(error => {
        console.error('Image upload failed:', error);
      });
    };

    editor.create();
    editor.txt.html(editorContent);

    return () => {
      editor.destroy();
    };
  }, [editorContent, setEditorContent]);

  return <div ref={editorRef} />;
};

export default RichTextEditor;