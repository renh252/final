import { useEffect } from "react";
import { i18nAddResources, i18nChangeLanguage } from "@wangeditor/editor";

// 繁體中文語系設定
const setupI18n = () => {
  i18nAddResources("zh-TW", {
    common: {
      ok: "確認",
      delete: "刪除",
      enter: "回車",
    },
    blockQuote: { title: "引用" },
    codeBlock: { title: "程式碼塊" },
    color: {
      color: "文字顏色",
      bgColor: "背景顏色",
      default: "預設顏色",
      clear: "清除背景顏色",
    },
    divider: { title: "分隔線" },
    emotion: { title: "表情" },
    fontSize: { title: "字號", default: "預設字號" },
    fontFamily: { title: "字體", default: "預設字體" },
    fullScreen: { title: "全螢幕" },
    header: { title: "標題", text: "正文" },
    image: {
      netImage: "網路圖片",
      delete: "刪除圖片",
      edit: "編輯圖片",
      viewLink: "查看連結",
      src: "圖片網址",
      desc: "圖片描述",
      link: "圖片連結",
    },
    indent: { decrease: "減少縮排", increase: "增加縮排" },
    justify: {
      left: "靠左對齊",
      right: "靠右對齊",
      center: "置中對齊",
      justify: "兩端對齊",
    },
    lineHeight: { title: "行高", default: "預設行高" },
    link: {
      insert: "插入連結",
      text: "連結文字",
      url: "連結網址",
      unLink: "取消連結",
      edit: "編輯連結",
      view: "查看連結",
    },
    textStyle: {
      bold: "粗體",
      clear: "清除格式",
      code: "行內程式碼",
      italic: "斜體",
      sub: "下標",
      sup: "上標",
      through: "刪除線",
      underline: "底線",
    },
    undo: { undo: "復原", redo: "重做" },
    todo: { todo: "待辦事項" },
    placeholder: { default: "請輸入內容..." },
  });

  // 確保語系切換在編輯器載入前執行
  i18nChangeLanguage("zh-TW");
};

// 在 `useEffect()` 內部執行語系設定，確保 Next.js SSR 沒有問題
const I18nSetup = () => {
  useEffect(() => {
    setupI18n();
  }, []);
  
  return null; // 不渲染任何內容，只是執行設定
};

export default I18nSetup;
