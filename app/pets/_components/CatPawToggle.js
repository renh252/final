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

  // 設置元件尺寸
  useEffect(() => {
    document.documentElement.style.setProperty('--size', size)
  }, [size])

  // 同步外部 isEnabled 與內部 currentValue
  useEffect(() => {
    setCurrentValue(isEnabled)
    // 初始化時設定貓掌方向
    setSvgClass(isEnabled ? [] : [styles.mirror])
  }, [isEnabled])

  // 動畫參數設定
  const keyframeOptionMap = {
    in: {
      'cat-arm-1': {},
      'cat-arm-2': {
        easing: 'easeInOutQuad',
        duration: 200,
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
      },
      'cat-arm-1': {
        easing: 'linear',
        duration: 100,
      },
    },
  }

  // 播放動畫到指定關鍵幀
  const toKeyframe = async (direction, keyframeId) => {
    const pathData = {
      'cat-arm-1': {
        arm: 'M308 75C319 75.0002 361.5 75.0002 373 75.0001',
        elbow: 'M322 75C345 75 383.5 75 399.5 75',
        pads: {
          'metacarpal-pad':
            'M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z',
          'digital-pad-1':
            'M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z',
          'digital-pad-2':
            'M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z',
          'digital-pad-3':
            'M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z',
          'digital-pad-4':
            'M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z',
        },
      },
      'cat-arm-2': {
        arm: 'M308 75C319 75.0002 518.5 75.0001 530 75',
        elbow: 'M531.5 75C554.5 75 563.5 75 579.5 75',
        pads: {
          'metacarpal-pad':
            'M588.941 75.0441C588.941 86.6665 579.875 96.0882 568.691 96.0882C557.507 96.0882 554 87.562 554 75.9396C554 64.3173 557.507 54 568.691 54C579.875 54 588.941 63.4218 588.941 75.0441Z',
          'digital-pad-1':
            'M600 53.1618C600 56.0125 596.628 58.3235 593.338 58.3235C590.049 58.3235 587.382 56.0125 587.382 53.1618C587.382 50.311 590.049 48 593.338 48C596.628 48 600 50.311 600 53.1618Z',
          'digital-pad-2':
            'M599 97.5C599 100.351 595.834 102 592.544 102C589.255 102 586.588 99.689 586.588 96.8383C586.588 93.9875 589.255 91.6765 592.544 91.6765C595.834 91.6765 599 94.6492 599 97.5Z',
          'digital-pad-3':
            'M612 67.4559C612 70.7452 607.473 73.4118 602.868 73.4118C598.262 73.4118 594.529 70.7452 594.529 67.4559C594.529 64.1665 598.262 61.5 602.868 61.5C607.473 61.5 612 64.1665 612 67.4559Z',
          'digital-pad-4':
            'M612 82.544C612 85.8334 607.473 88.4999 602.868 88.4999C598.262 88.4999 594.529 85.8334 594.529 82.544C594.529 79.2547 598.262 76.5881 602.868 76.5881C607.473 76.5881 612 79.2547 612 82.544Z',
        },
      },
      'cat-arm-3': {
        arm: 'M308 75.0002C319 75.0004 497 68.5002 524.5 75.0002',
        elbow: 'M514 74.76C528.5 75.76 536 72.76 541 80.26',
        pads: {
          'metacarpal-pad':
            'M545.317 80.1338C541.584 91.1404 539.242 101.823 531.799 99.2985C524.356 96.7743 521.955 85.1404 525.688 74.1338C529.421 63.1272 537.874 56.916 545.317 59.4402C552.76 61.9645 549.05 69.1272 545.317 80.1338Z',
          'digital-pad-1':
            'M553.5 57.7598C552.584 60.4595 551.756 62.5057 548.641 61.4492C545.525 60.3928 543.742 57.3478 544.658 54.648C545.574 51.9483 548.841 50.6162 551.956 51.6727C555.071 52.7292 554.416 55.06 553.5 57.7598Z',
          'digital-pad-2':
            'M537.139 103.931C536.223 106.631 535.756 108.506 532.641 107.449C529.525 106.393 527.742 103.348 528.658 100.648C529.574 97.9486 532.841 96.6165 535.956 97.6729C539.071 98.7294 538.054 101.231 537.139 103.931Z',
          'digital-pad-3':
            'M554.633 74.9987C553.577 78.1138 552.869 80.7094 550.069 79.7599C547.269 78.8104 545.856 75.5154 546.913 72.4003C547.969 69.2853 551.095 67.5297 553.895 68.4792C556.694 69.4287 555.69 71.8837 554.633 74.9987Z',
          'digital-pad-4':
            'M548.366 89.5022C547.31 92.6172 546.335 95.5283 543.725 94.6432C541.115 93.7582 539.856 90.5154 540.913 87.4003C541.969 84.2853 544.941 82.4775 547.551 83.3626C550.161 84.2477 549.423 86.3871 548.366 89.5022Z',
        },
      },
      'cat-arm-4': {
        arm: 'M308 75C319 75.0002 446.5 52.9998 526 75',
        elbow: 'M524 75C548.5 75 537.5 105 506 105',
        pads: {
          'metacarpal-pad':
            'M524.193 105.216C523.256 116.8 522.38 127.633 522.38 127.633C522.38 127.633 523.206 117.42 524.143 105.836C525.08 94.2513 525.773 85.6821 525.773 85.6821C525.773 85.6821 525.13 93.631 524.193 105.216Z',
          'digital-pad-1':
            'M525.412 82.4362C525.182 85.2777 525.004 87.4745 525.004 87.4745C525.004 87.4745 525.19 85.171 525.42 82.3295C525.65 79.488 525.836 77.1846 525.836 77.1846C525.837 77.1846 525.642 79.5947 525.412 82.4362Z',
          'digital-pad-2':
            'M519.385 128.56C519.156 131.401 519 133.321 519 133.321C519 133.321 519.187 131.018 519.416 128.176C519.646 125.335 519.833 123.031 519.833 123.031C519.833 123.031 519.615 125.718 519.385 128.56Z',
          'digital-pad-3':
            'M523.203 97.0482C522.938 100.327 522.721 103.004 522.721 103.004C522.721 103.004 522.936 100.346 523.201 97.0671C523.467 93.7885 523.682 91.1306 523.682 91.1306C523.682 91.1306 523.468 93.7696 523.203 97.0482Z',
          'digital-pad-4':
            'M520.828 111.705C520.563 114.984 520.315 118.044 520.315 118.044C520.315 118.044 520.53 115.386 520.795 112.107C521.06 108.829 521.275 106.171 521.275 106.171C521.275 106.171 521.093 108.427 520.828 111.705Z',
        },
      },
      'cat-arm-5': {
        arm: 'M308 75.0004C319 75.0006 521 50.4999 533.5 83.5',
        elbow: 'M531.5 82C559.5 91 449 122 405.5 102.5',
        pads: {
          'metacarpal-pad':
            'M399.888 108.52C396.155 119.526 392.664 129.819 392.664 129.819C392.664 129.819 395.955 120.115 399.688 109.109C403.421 98.1023 406.182 89.9607 406.182 89.9607C406.182 89.9607 403.621 97.513 399.888 108.52Z',
          'digital-pad-1':
            'M406.623 86.7247C405.708 89.4245 405 91.5117 405 91.5117C405 91.5117 405.742 89.3231 406.658 86.6234C407.573 83.9237 408.315 81.7351 408.315 81.7351C408.316 81.7351 407.539 84.025 406.623 86.7247Z',
          'digital-pad-2':
            'M389.535 129.988C388.619 132.687 388 134.511 388 134.511C388 134.511 388.742 132.323 389.658 129.623C390.574 126.923 391.316 124.735 391.316 124.735C391.316 124.735 390.45 127.288 389.535 129.988Z',
          'digital-pad-3':
            'M400.919 100.357C399.862 103.472 399 106.016 399 106.016C399 106.016 399.856 103.49 400.913 100.375C401.969 97.2601 402.826 94.7349 402.826 94.7349C402.826 94.7349 401.975 97.2422 400.919 100.357Z',
          'digital-pad-4':
            'M395.042 113.993C393.986 117.108 393 120.016 393 120.016C393 120.016 393.856 117.491 394.913 114.375C395.969 111.26 396.826 108.735 396.826 108.735C396.826 108.735 396.099 110.878 395.042 113.993Z',
        },
      },
    }

    const options = keyframeOptionMap[direction][keyframeId]

    // 設置動畫中的狀態
    if (keyframeId === 'cat-arm-2') {
      // 使用更準確的選擇器找到所有相關元素
      const catElbow = document.querySelector(`.${uid}-cat-elbow`)
      const catElements = document.querySelectorAll(`.${uid}-cat-arm path`)

      if (direction === 'in') {
        if (catElbow) catElbow.classList.add('animating')
        catElements.forEach((el) => {
          if (
            el.classList.contains('digital-pad-1') ||
            el.classList.contains('digital-pad-2') ||
            el.classList.contains('digital-pad-3') ||
            el.classList.contains('digital-pad-4') ||
            el.classList.contains('metacarpal-pad')
          ) {
            el.classList.add('animating')
          }
        })
      } else if (direction === 'out') {
        if (catElbow) catElbow.classList.remove('animating')
        catElements.forEach((el) => {
          el.classList.remove('animating')
        })
      }
    }

    // 為每個物件設定動畫
    const tasks = []

    // 手臂和手肘的動畫
    ;['arm', 'elbow'].forEach((objectId) => {
      const d = pathData[keyframeId]?.[objectId]
      if (d) {
        tasks.push(
          anime({
            targets: `.${uid}-cat-arm .${objectId}`,
            d,
            ...options,
          }).finished
        )
      }
    })

    // 肉球的動畫
    Object.entries(pathData[keyframeId]?.pads || {}).forEach(([padId, d]) => {
      tasks.push(
        anime({
          targets: `.${uid}-cat-arm .${padId}`,
          d,
          ...options,
        }).finished
      )
    })

    return Promise.all(tasks)
  }

  // 隨機毛色
  const randomFurColor = () => {
    const colors = ['#F3F2F2', '#8D6F64', '#DFC57B', '#222']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 隨機肉球顏色
  const randomPadColor = () => {
    const colors = ['#FFA5A5', '#FFF']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 開始貓手動畫
  const start = async () => {
    if (dynamicColor) {
      setFurColorDynamic(randomFurColor())
      setPadColorDynamic(randomPadColor())
    }

    setIsPlaying(true)

    // 保留當前方向播放伸出動畫
    for (const id of ['cat-arm-2', 'cat-arm-3', 'cat-arm-4']) {
      await toKeyframe('in', id)
    }

    // 完成最後的動畫
    await toKeyframe('in', 'cat-arm-5')

    // 切換狀態
    const newValue = !currentValue
    setCurrentValue(newValue)
    if (typeof onToggle === 'function') {
      onToggle(newValue)
    }

    // 播放收回動畫
    for (const id of ['cat-arm-4', 'cat-arm-3', 'cat-arm-2', 'cat-arm-1']) {
      await toKeyframe('out', id)
    }

    // 動畫完全結束後，再變換方向
    setSvgClass(newValue ? [] : [styles.mirror])

    setIsPlaying(false)
  }

  // 處理點擊事件
  const handleClick = () => {
    if (isPlaying || disabled) return
    start()
  }

  return (
    <button
      className={styles.toggleContainer}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={currentValue}
      aria-label="切換開關"
      role="switch"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div
        className={
          styles.track +
          ' ' +
          (currentValue ? styles.trackActive : styles.trackInactive)
        }
      >
        <div
          className={`${styles.thumb} ${currentValue ? styles.active : ''}`}
        />
      </div>

      <svg
        width="640"
        height="155"
        viewBox="0 0 640 155"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${styles.svg} ${uid}-cat-arm ${svgClass.join(' ')}`}
      >
        <path
          className="arm"
          d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
          stroke={furColorDynamic}
          strokeWidth="80"
          strokeLinecap="round"
        />
        <g className={`${styles['cat-elbow']} ${uid}-cat-elbow`}>
          <path
            className="elbow"
            d="M322 75C345 75 383.5 75 399.5 75"
            stroke={furColorDynamic}
            strokeWidth="80"
            strokeLinecap="round"
          />
          <path
            className="metacarpal-pad"
            d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
            fill={padColorDynamic}
          />
          <path
            className="digital-pad-1"
            d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
            fill={padColorDynamic}
          />
          <path
            className="digital-pad-2"
            d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
            fill={padColorDynamic}
          />
          <path
            className="digital-pad-3"
            d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
            fill={padColorDynamic}
          />
          <path
            className="digital-pad-4"
            d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
            fill={padColorDynamic}
          />
        </g>
      </svg>
    </button>
  )
}

export default CatPawToggle
