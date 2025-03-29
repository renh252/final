'use client'

import { useState } from 'react'
import styles from './cat-paw-parts.module.css'

export default function CatPawPartsPage() {
  const [furColor, setFurColor] = useState('#222')
  const [padColor, setPadColor] = useState('#FFA5A5')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>貓掌元件結構展示</h1>

      <div className={styles.colorControls}>
        <div className={styles.colorPicker}>
          <label>毛色：</label>
          <input
            type="color"
            value={furColor}
            onChange={(e) => setFurColor(e.target.value)}
          />
        </div>
        <div className={styles.colorPicker}>
          <label>肉掌顏色：</label>
          <input
            type="color"
            value={padColor}
            onChange={(e) => setPadColor(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.partsContainer}>
        {/* Arm 部分 */}
        <div className={styles.partSection}>
          <h2>手臂 (Arm)</h2>
          <div className={styles.partDemo}>
            <svg
              width="640"
              height="155"
              viewBox="0 0 640 155"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.svg}
            >
              <path
                className="arm"
                d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
                stroke={furColor}
                strokeWidth="80"
                strokeLinecap="round"
              />
            </svg>
            <div className={styles.partDescription}>
              <p>手臂部分只包含一個基本的描邊路徑，用來表示貓的手臂。</p>
              <p>z-index 設為較低層級，位於 toggle 下方。</p>
              <pre>z-index: 1</pre>
            </div>
          </div>
        </div>

        {/* Elbow 部分 */}
        <div className={styles.partSection}>
          <h2>肘部 (Elbow)</h2>
          <div className={styles.partDemo}>
            <svg
              width="640"
              height="155"
              viewBox="0 0 640 155"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.svg}
            >
              <path
                className="elbow"
                d="M322 75C345 75 383.5 75 399.5 75"
                stroke={furColor}
                strokeWidth="80"
                strokeLinecap="round"
              />
            </svg>
            <div className={styles.partDescription}>
              <p>肘部也是一個描邊路徑，在動畫中z-index會提高。</p>
              <p>初始時位於 toggle 下方，動畫時提高到上方。</p>
              <pre>
                初始 z-index: 0<br />
                動畫中 z-index: 30
              </pre>
            </div>
          </div>
        </div>

        {/* Paw 部分 */}
        <div className={styles.partSection}>
          <h2>肉掌 (Paw)</h2>
          <div className={styles.partDemo}>
            <svg
              width="640"
              height="155"
              viewBox="0 0 640 155"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.svg}
            >
              <g>
                <path
                  className="metacarpal-pad"
                  d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-1"
                  d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-2"
                  d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-3"
                  d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-4"
                  d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
                  fill={padColor}
                />
              </g>
            </svg>
            <div className={styles.partDescription}>
              <p>肉掌包含多個填充路徑，表示貓爪的肉墊。</p>
              <p>動畫時與肘部一起提高z-index到上方。</p>
              <pre>
                初始 z-index: 0<br />
                動畫中 z-index: 30
              </pre>
            </div>
          </div>
        </div>

        {/* 完整組合 */}
        <div className={styles.partSection}>
          <h2>完整組合</h2>
          <div className={styles.partDemo}>
            <svg
              width="640"
              height="155"
              viewBox="0 0 640 155"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.svg}
            >
              <path
                className="arm"
                d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
                stroke={furColor}
                strokeWidth="80"
                strokeLinecap="round"
                style={{ zIndex: 1 }}
              />
              <g className="cat-elbow">
                <path
                  className="elbow"
                  d="M322 75C345 75 383.5 75 399.5 75"
                  stroke={furColor}
                  strokeWidth="80"
                  strokeLinecap="round"
                />
                <path
                  className="metacarpal-pad"
                  d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-1"
                  d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-2"
                  d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-3"
                  d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
                  fill={padColor}
                />
                <path
                  className="digital-pad-4"
                  d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
                  fill={padColor}
                />
              </g>
            </svg>
            <div className={styles.partDescription}>
              <p>完整的貓手包含手臂、肘部和肉掌。</p>
              <p>
                動畫中，手臂保持在 toggle 下方，肘部和肉掌提高到 toggle 上方。
              </p>
              <p>這樣才能實現貓掌「搗亂」的效果。</p>
            </div>
          </div>
        </div>

        {/* Toggle 示範 */}
        <div className={styles.partSection}>
          <h2>Toggle 樣式</h2>
          <div className={styles.toggleDemo}>
            <div className={styles.toggleExample}>
              <div className={`${styles.trackExample} ${styles.trackInactive}`}>
                <div className={styles.thumbExample}></div>
              </div>
              <p>關閉狀態 (白色背景)</p>
              <pre>z-index: 10</pre>
            </div>

            <div className={styles.toggleExample}>
              <div className={`${styles.trackExample} ${styles.trackActive}`}>
                <div
                  className={`${styles.thumbExample} ${styles.thumbActive}`}
                ></div>
              </div>
              <p>開啟狀態 (綠色背景)</p>
              <pre>z-index: 10</pre>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.animationDescription}>
        <h2>動畫流程說明</h2>
        <ol>
          <li>
            用戶點擊 toggle → toggle 立即從白色變為綠色（視覺狀態從 0 變為 1）
          </li>
          <li>短暫延遲後（300ms），貓手動畫開始</li>
          <li>
            貓手從側邊伸出，肘部和肉掌的 z-index 提高到 toggle 上方（z-index:
            30）
          </li>
          <li>
            貓手伸到最遠處時，將 toggle 狀態從綠色切換回白色（視覺狀態從 1 變回
            0）
          </li>
          <li>貓手慢慢收回，同時肘部和肉掌的 z-index 逐漸降低</li>
          <li>動畫完成後設置正確的 mirror 效果，準備下一次交互</li>
        </ol>
      </div>
    </div>
  )
}
