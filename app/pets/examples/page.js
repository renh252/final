'use client'

import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import CatPawToggle from '@/app/pets/_components/CatPawToggle'
import styles from './examples.module.css'

// 基本使用範例
const BasicUsageExample = () => {
  const [value, setValue] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const handleToggle = (newValue) => {
    setValue(newValue)
  }

  return (
    <div className="w-full flex flex-col gap-4 border border-gray-300 p-6 rounded">
      <Form.Check
        type="checkbox"
        id="disable-toggle"
        label="停用開關"
        checked={disabled}
        onChange={(e) => setDisabled(e.target.checked)}
        className="border rounded p-4"
      />

      <div className="flex flex-1 items-center justify-center">
        <CatPawToggle
          isEnabled={value}
          onToggle={handleToggle}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

// 自定義屬性範例
const CustomPropExample = () => {
  return (
    <div className="w-full flex flex-col items-center gap-10 border border-gray-300 p-8 rounded">
      <CatPawToggle
        isEnabled={false}
        onToggle={() => {}}
        disabled={true}
        size="3rem"
        furColor="#DFC57B"
        padColor="#FFF"
      />

      <CatPawToggle
        isEnabled={true}
        onToggle={() => {}}
        disabled={true}
        size="6rem"
        furColor="#8D6F64"
        padColor="#000"
      />

      <CatPawToggle
        isEnabled={false}
        onToggle={() => {}}
        disabled={true}
        size="4rem"
        furColor="#F3F2F2"
        padColor="#FFA5A5"
      />
    </div>
  )
}

// 不可能三角範例
const ImpossibleThingExample = () => {
  // 定義狀態列表
  const [stateList, setStateList] = useState([
    {
      label: '要快',
      value: false,
    },
    {
      label: '要好',
      value: false,
    },
    {
      label: '要便宜',
      value: false,
    },
  ])

  // 顏色設定
  const colorOptions = [
    {
      furColor: '#7DDAEA',
      padColor: '#000',
    },
    {
      furColor: '#FAFAFA',
      padColor: '#FFA5A5',
    },
    {
      furColor: '#DFC57B',
      padColor: '#000',
    },
    {
      furColor: '#8D6F64',
      padColor: '#FFA5A5',
    },
    {
      furColor: '#444',
      padColor: '#FFA5A5',
    },
    {
      furColor: '#F3F2F2',
      padColor: '#000',
    },
  ]

  const [colorIndex, setColorIndex] = useState(0)
  const toggleRefs = useRef([])

  // 處理狀態變更
  const handleToggle = (index, newValue) => {
    const newStateList = [...stateList]
    newStateList[index].value = newValue
    setStateList(newStateList)

    // 檢查是否所有的都為true
    const allTrue = newStateList.every((state) => state.value)

    if (allTrue) {
      // 隨機選擇一個不是最後更改的toggle來自動切換
      const previousTrueIndices = stateList
        .map((state, i) => (state.value ? i : -1))
        .filter((i) => i !== -1 && i !== index)

      if (previousTrueIndices.length > 0) {
        // 隨機選擇一個要切換的索引
        const randomIndex = Math.floor(
          Math.random() * previousTrueIndices.length
        )
        const targetIndex = previousTrueIndices[randomIndex]

        // 更改顏色
        setColorIndex((prevIndex) => (prevIndex + 1) % colorOptions.length)

        // 更新狀態
        setTimeout(() => {
          const updatedStateList = [...newStateList]
          updatedStateList[targetIndex].value = false
          setStateList(updatedStateList)
        }, 500)
      }
    }
  }

  return (
    <div className="w-full flex-center border border-gray-300 p-10 rounded">
      <div className="flex flex-col gap-4">
        {stateList.map((state, index) => (
          <label
            key={state.label}
            className="flex cursor-pointer items-center justify-end gap-5"
          >
            <div className="text-2xl">{state.label}</div>

            <CatPawToggle
              ref={(el) => (toggleRefs.current[index] = el)}
              isEnabled={state.value}
              onToggle={(newValue) => handleToggle(index, newValue)}
              furColor={colorOptions[colorIndex].furColor}
              padColor={colorOptions[colorIndex].padColor}
              size="3.5rem"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

// 條款閱讀範例
const TermsExampleComponent = () => {
  const [value, setValue] = useState(false)
  const [readRate, setReadRate] = useState(0)
  const [titleVisibility, setTitleVisibility] = useState({})
  const termsContainerRef = useRef(null)
  const titleRefsMap = useRef({})

  // 註冊標題ref
  const registerTitleRef = (index, el) => {
    if (el) {
      titleRefsMap.current[index] = el
    }
  }

  // 追蹤閱讀進度
  useEffect(() => {
    // 觀察器設定
    const observerOptions = {
      root: termsContainerRef.current,
      rootMargin: '0px',
      threshold: 0.5,
    }

    // 最小閱讀時間 (毫秒)
    const MIN_READ_MS = 1000
    const visibilityTimes = {}
    const startTimes = {}

    // 建立觀察器
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.dataset.id

        if (entry.isIntersecting) {
          // 開始計時
          startTimes[id] = Date.now()
        } else if (startTimes[id]) {
          // 計算可見時間
          const visibleTime = Date.now() - startTimes[id]
          visibilityTimes[id] =
            (visibilityTimes[id] || 0) + Math.min(visibleTime, MIN_READ_MS)
          startTimes[id] = null

          // 更新進度
          updateReadRate()
        }
      })
    }, observerOptions)

    // 觀察所有標題
    Object.entries(titleRefsMap.current).forEach(([id, element]) => {
      if (element) {
        observer.observe(element)
      }
    })

    // 更新閱讀進度
    const updateReadRate = () => {
      const totalSections = Object.keys(titleRefsMap.current).length
      if (totalSections === 0) return 0

      let totalReadTime = 0
      Object.values(visibilityTimes).forEach((time) => {
        totalReadTime += Math.min(time, MIN_READ_MS)
      })

      const progressPercent =
        (totalReadTime / (MIN_READ_MS * totalSections)) * 100
      setReadRate(progressPercent)
    }

    // 清理
    return () => {
      observer.disconnect()
    }
  }, [])

  // 處理捲動事件
  const handleScroll = () => {
    if (!termsContainerRef.current) return

    // 手動計算閱讀進度 (簡化版)
    const container = termsContainerRef.current
    const scrollPercent =
      (container.scrollTop /
        (container.scrollHeight - container.clientHeight)) *
      100

    // 這裡我們使用捲動位置來近似閱讀進度
    // 實際使用中，應該結合標題的可見時間來計算
    setReadRate(Math.max(readRate, Math.min(scrollPercent, 100)))
  }

  return (
    <div className="relative w-full flex flex-center flex-col gap-4 border border-gray-300 p-6 rounded">
      <div
        ref={termsContainerRef}
        className="h-[40vh] overflow-y-auto border rounded-xl p-4"
        onScroll={handleScroll}
      >
        <h1>🐟 鱈魚使用須知</h1>

        <h2 data-id="1" ref={(el) => registerTitleRef(1, el)}>
          📌 重要聲明
        </h2>
        <p>
          本指南適用於任何與鱈魚相關的活動，例如食用、觀賞、聊天、或試圖與其建立深厚友誼（不建議）。
        </p>

        <h2 data-id="2" ref={(el) => registerTitleRef(2, el)}>
          🍽️ 食用須知
        </h2>
        <ul>
          <li>請確保鱈魚已煮熟，除非你是北極熊。</li>
          <li>如果你發現鱈魚在盤子上對你微笑，請確認你沒有嗑藥。</li>
          <li>鱈魚富含不可名狀物質，吃多了可能出現幻覺。</li>
        </ul>

        <h2 data-id="3" ref={(el) => registerTitleRef(3, el)}>
          🐠 觀賞須知
        </h2>
        <ul>
          <li>鱈魚外觀樸素，請勿種族歧視。</li>
          <li>請勿在水族館對著鱈魚說「你好肥」，牠們也有自尊心。</li>
        </ul>

        <h2 data-id="4" ref={(el) => registerTitleRef(4, el)}>
          💬 與鱈魚溝通須知
        </h2>
        <ul>
          <li>鱈魚不會講話，請不要對牠進行長篇演講。</li>
          <li>如果鱈魚對你點頭，請不要高興得太早，牠可能只是因為水流晃動。</li>
          <li>與鱈魚進行心靈溝通時，請確保你沒有餓過頭導致出現幻覺。</li>
        </ul>

        <h2 data-id="5" ref={(el) => registerTitleRef(5, el)}>
          🚨 禁忌事項
        </h2>
        <ol>
          <li>請勿將鱈魚放入洗衣機，可能也洗不乾淨。</li>
          <li>請勿將鱈魚作為武器使用，除非已事先凍成冰塊。</li>
          <li>請勿遛鱈魚，因為他不會走路</li>
        </ol>

        <h2 data-id="6" ref={(el) => registerTitleRef(6, el)}>
          🎉 結語
        </h2>
        <p>請以尊重與幽默的態度對待鱈魚，如有任何不滿，請記得它只是一隻魚</p>
        <p>歡迎提出 MR 補充以上須知</p>
      </div>

      <div>閱讀率：{readRate.toFixed(1)}%</div>

      <label className="w-full flex-center cursor-pointer gap-6 border rounded-xl px-8 py-4 text-lg">
        我已詳閱以上須知
        <CatPawToggle
          isEnabled={value}
          onToggle={(newValue) => setValue(newValue)}
          disabled={readRate < 100}
          size="2rem"
        />
      </label>

      {value && (
        <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center gap-6 rounded-xl bg-[#c7f6ff] bg-opacity-90 transition-opacity duration-400">
          <span className="text-xl tracking-wide">感謝您的閱讀！(*´∀`)~♥</span>
        </div>
      )}
    </div>
  )
}

export default function ToggleExamples() {
  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">貓手 Toggle 元件展示</h1>

      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <h2 className="h4 mb-3">基本使用</h2>
          <BasicUsageExample />
        </Col>

        <Col md={6} className="mb-4">
          <h2 className="h4 mb-3">自定義屬性</h2>
          <CustomPropExample />
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={12} className="mb-4">
          <h2 className="h4 mb-3">不可能三角</h2>
          <ImpossibleThingExample />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h2 className="h4 mb-3">條款閱讀範例</h2>
          <TermsExampleComponent />
        </Col>
      </Row>
    </Container>
  )
}
