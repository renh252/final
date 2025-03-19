import React from 'react';

const EditorToolbar = ({ onFormat }) => {
  const handleFormat = (format) => {
    if (onFormat) {
      onFormat(format);
    }
  };

  return (
    <div className="editor-toolbar">
      <button onClick={() => handleFormat('bold')} className="btn btn-light">
        <strong>B</strong>
      </button>
      <button onClick={() => handleFormat('italic')} className="btn btn-light">
        <em>I</em>
      </button>
      <button onClick={() => handleFormat('underline')} className="btn btn-light">
        <u>U</u>
      </button>
      <button onClick={() => handleFormat('strikeThrough')} className="btn btn-light">
        <s>S</s>
      </button>
      <button onClick={() => handleFormat('header1')} className="btn btn-light">
        H1
      </button>
      <button onClick={() => handleFormat('header2')} className="btn btn-light">
        H2
      </button>
      <button onClick={() => handleFormat('list')} className="btn btn-light">
        List
      </button>
      <button onClick={() => handleFormat('quote')} className="btn btn-light">
        Quote
      </button>
    </div>
  );
};

export default EditorToolbar;