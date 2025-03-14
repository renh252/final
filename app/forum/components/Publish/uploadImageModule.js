'use client';

// 自定義圖片上傳模組
export const uploadImageModule = {
  key: 'uploadImage',
  
  // 在編輯器中添加自定義按鈕
  toolbar: {
    title: '上傳圖片',
    iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
  },
  
  // 渲染插入的圖片
  renderElems: (elemNode) => {
    if (elemNode.type !== 'image') return;
    
    const { src, alt, href, width, height } = elemNode;
    
    // 返回要渲染的圖片元素
    return React.createElement('img', {
      src,
      alt,
      href,
      width,
      height,
      style: { maxWidth: '100%' }
    });
  }
};