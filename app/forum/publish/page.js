"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "@wangeditor/editor/dist/css/style.css";
//import I18nSetup from "../_components/i18n";
//I18nSetup();


const Editor = dynamic(
  () => import("@wangeditor/editor-for-react").then((mod) => mod.Editor),
  { ssr: false }
);

const Toolbar = dynamic(
  () => import("@wangeditor/editor-for-react").then((mod) => mod.Toolbar),
  { ssr: false }
);

export default function Page() {
  const [editor, setEditor] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  const toolbarConfig = {};
  const editorConfig = {
    placeholder: '請輸入內容...',
  };

  if (!isClient) return <p>載入中...</p>;

  return (
    <div style={{
        position: 'fixed',
        top: '40px', // 调整这个值以适应你的菜单栏高度
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 100,
        backgroundColor: 'white',
        padding: '20px',
        overflowY: 'auto'
      }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={editorContent}
        onCreated={setEditor}
        onChange={(editor) => setEditorContent(editor.getHtml())}
        mode="default"
        style={{ height: '400px', overflowY: 'hidden' }}
      />
      <h2>預覽 HTML：</h2>
      <div dangerouslySetInnerHTML={{ __html: editorContent }} />
    </div>
  );
}