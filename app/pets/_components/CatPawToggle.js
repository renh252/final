'use client'

import { useState, useEffect, useRef, useId } from 'react'
import anime from 'animejs/lib/anime.es.js'
import styles from './CatPawToggle.module.css'

/**
 * 貓手 Toggle 元件
 * @param {Object} props
 * @param {boolean} props.isEnabled - 開關狀態
 * @param {function} props.onToggle - 切換回調函數
 * @param {boolean} props.disabled - 是否禁用 (預設: false)
 * @param {string} props.size - 元件尺寸 (預設: '4rem')
 * @param {string} props.furColor - 毛色 (預設: '#222')
 * @param {string} props.padColor - 肉球顏色 (預設: '#FFA5A5')
 * @param {boolean} props.dynamicColor - 是否使用隨機顏色 (預設: false)
 */
const CatPawToggle = ({
  isEnabled = false,
  onToggle = () => {},
  disabled = false,
  size = '4rem',
  furColor = '#222',
  padColor = '#FFA5A5',
  dynamicColor = false,
}) => {
  const [currentValue, setCurrentValue] = useState(isEnabled)
  const [isPlaying, setIsPlaying] = useState(false)
  const [svgClass, setSvgClass] = useState([])
  const [furColorDynamic, setFurColorDynamic] = useState(furColor)
  const [padColorDynamic, setPadColorDynamic] = useState(padColor)

  // 用於生成唯一ID
  const uid = useId().replace(/:/g, '-')

  // 關鍵幀數據的引用
  const keyframeAttrMapRef = useRef({})

  // ID常量定義
  const OBJECT_IDS = [
    'cat-elbow',
    'arm',
    'elbow',
    'metacarpal-pad',
    'pads',
    'digital-pad-1',
    'digital-pad-2',
    'digital-pad-3',
    'digital-pad-4',
  ]

  const KEYFRAME_IDS = [
    'cat-arm-1',
    'cat-arm-2',
    'cat-arm-3',
    'cat-arm-4',
    'cat-arm-5',
  ]

  // 動畫參數設定
  const keyframeOptionMap = {
    in: {
      'cat-arm-1': {},
      'cat-arm-2': {
        easing: 'easeInOutQuad',
        duration: 200,
        objectAttrMap: {
          'cat-elbow': { zIndex: 2 },
        },
      },
      'cat-arm-3': {
        easing: 'linear',
        duration: 50,
      },
      'cat-arm-4': {
        easing: 'linear',
        duration: 50,
      },
      'cat-arm-5': {
        easing: 'easeOutBack',
        duration: 200,
      },
    },
    out: {
      'cat-arm-5': {},
      'cat-arm-4': {
        easing: 'easeInQuad',
        duration: 100,
      },
      'cat-arm-3': {
        easing: 'linear',
        duration: 60,
      },
      'cat-arm-2': {
        easing: 'linear',
        duration: 60,
        objectAttrMap: {
          'cat-elbow': { zIndex: 0 },
        },
      },
      'cat-arm-1': {
        easing: 'linear',
        duration: 100,
      },
    },
  }

  // 初始化關鍵幀數據
  useEffect(() => {
    // 在組件卸載時清理動畫
    return () => {
      OBJECT_IDS.forEach((id) => {
        anime.remove(`#${uid}-cat-arm #${id}`)
      })
    }
  }, [])

  // 獲取當前軌道和滑塊的樣式類名
  const getTrackClasses = () => {
    return `${styles.track} ${
      currentValue ? styles.trackActive : styles.trackInactive
    } rounded-full`
  }

  const getThumbClasses = () => {
    return `${styles.thumb} ${
      currentValue ? styles.active : ''
    } rounded-full bg-white`
  }

  // 播放動畫到指定關鍵幀
  const toKeyframe = async (direction, keyframeId) => {
    // 由於React不像Vue那樣方便地從DOM中讀取屬性
    // 這裡我們直接定義關鍵幀的路徑數據
    const pathData = {
      'cat-arm-1': {
        arm: 'M308 75C319 75.0002 361.5 75.0002 373 75.0001',
        elbow: 'M322 75C345 75 383.5 75 399.5 75',
      },
      'cat-arm-2': {
        arm: 'M308 75C319 75.0002 518.5 75.0001 530 75',
        elbow: 'M531.5 75C554.5 75 563.5 75 579.5 75',
      },
      'cat-arm-3': {
        arm: 'M308 75.0002C319 75.0004 497 68.5002 524.5 75.0002',
        elbow: 'M514 74.76C528.5 75.76 536 72.76 541 80.26',
      },
      'cat-arm-4': {
        arm: 'M308 75C319 75.0002 446.5 52.9998 526 75',
        elbow: 'M524 75C548.5 75 537.5 105 506 105',
      },
      'cat-arm-5': {
        arm: 'M308 75.0004C319 75.0006 521 50.4999 533.5 83.5',
        elbow: 'M531.5 82C559.5 91 449 122 405.5 102.5',
      },
    }

    // Pads數據太複雜，這裡略過，可以根據需要添加

    const options = keyframeOptionMap[direction][keyframeId]

    // 為每個物件設定動畫
    const tasks = OBJECT_IDS.filter((id) => ['arm', 'elbow'].includes(id)).map(
      (objectId) => {
        // 獲取路徑數據
        const d = pathData[keyframeId]?.[objectId]
        if (!d) return Promise.resolve()

        // 設定對象屬性
        const objectAttr = options.objectAttrMap?.[objectId] || {}

        // 使用anime.js執行動畫
        return anime({
          targets: `#${uid}-cat-arm #${objectId}`,
          d,
          ...options,
          ...objectAttr,
        }).finished
      }
    )

    // 如果存在對cat-elbow的z-index更改，直接應用到DOM元素
    if (options.objectAttrMap?.['cat-elbow']?.zIndex !== undefined) {
      const catElbow = document.getElementById(`${uid}-cat-elbow`)
      if (catElbow) {
        catElbow.style.zIndex = options.objectAttrMap['cat-elbow'].zIndex
      }
    }

    return Promise.all(tasks)
  }

  // 隨機顏色生成
  const randomFurColor = () => {
    const colors = ['#F3F2F2', '#8D6F64', '#DFC57B', '#222']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const randomPadColor = () => {
    const colors = ['#FFA5A5', '#FFF']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 開始貓手動畫
  const startAnimation = async () => {
    if (isPlaying) return

    // 設定方向
    setSvgClass(currentValue ? [] : [styles.mirror])

    // 如果啟用了動態顏色
    if (dynamicColor) {
      setFurColorDynamic(randomFurColor())
      setPadColorDynamic(randomPadColor())
    }

    setIsPlaying(true)

    // 動畫序列
    for (const id of ['cat-arm-2', 'cat-arm-3', 'cat-arm-4']) {
      await toKeyframe('in', id)
    }

    // 切換狀態並執行最後一步動畫
    setCurrentValue((prev) => !prev)
    await toKeyframe('in', 'cat-arm-5')

    // 回收貓手動畫
    for (const id of ['cat-arm-4', 'cat-arm-3', 'cat-arm-2', 'cat-arm-1']) {
      await toKeyframe('out', id)
    }

    setIsPlaying(false)
  }

  // 處理點擊事件
  const handleToggle = () => {
    if (isPlaying || disabled) {
      return
    }

    // 執行動畫並通知父組件
    startAnimation().then(() => {
      if (typeof onToggle === 'function') {
        onToggle(!currentValue)
      }
    })
  }

  // 同步外部isEnabled變更
  useEffect(() => {
    setCurrentValue(isEnabled)
  }, [isEnabled])

  return (
    <button
      className="cursor-pointer select-none overflow-visible bg-transparent border-0 p-0"
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleToggle()
        }
      }}
      disabled={disabled}
      aria-pressed={currentValue}
      aria-label="切換開關"
      role="switch"
    >
      <div className={styles.toggleProactive} style={{ height: size }}>
        <div id={`${uid}-cat-arm`} className="relative h-full w-full">
          {/* 貓手 */}
          <svg
            viewBox="0 0 640 155"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${styles.svg} ${
              svgClass.includes(styles.mirror) ? styles.mirror : ''
            }`}
            style={{ zIndex: 0 }}
          >
            <g>
              <path
                id="arm"
                d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
                stroke={furColorDynamic}
                strokeWidth="80"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {/* Toggle 開關 - 放在手臂和手肘之間 */}
          <div className={getTrackClasses()} style={{ zIndex: 1 }}>
            <div className={getThumbClasses()} />
          </div>

          {/* 手肘與肉球 */}
          <svg
            id={`${uid}-cat-elbow`}
            viewBox="0 0 640 155"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${styles.svg} ${
              svgClass.includes(styles.mirror) ? styles.mirror : ''
            }`}
            style={{ zIndex: 0 }} /* 初始時在toggle背後 */
          >
            <g>
              <path
                id="elbow"
                d="M322 75C345 75 383.5 75 399.5 75"
                stroke={furColorDynamic}
                strokeWidth="80"
                strokeLinecap="round"
              />
              <g id="pads">
                <path
                  id="metacarpal-pad"
                  d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
                  fill={padColorDynamic}
                />
                <path
                  id="digital-pad-1"
                  d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
                  fill={padColorDynamic}
                />
                <path
                  id="digital-pad-2"
                  d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
                  fill={padColorDynamic}
                />
                <path
                  id="digital-pad-3"
                  d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
                  fill={padColorDynamic}
                />
                <path
                  id="digital-pad-4"
                  d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
                  fill={padColorDynamic}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </button>
  )
}

export default CatPawToggle
