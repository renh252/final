'use client'

import { useRef, useEffect } from 'react'
import { useTheme } from '@/app/admin/ThemeContext'
import { Chart, registerables } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

// 註冊所有圖表類型
Chart.register(...registerables)

export function LineChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    // 如果已存在圖表，銷毀它
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // 根據主題設置顏色
    const gridColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
    const textColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)'

    // 創建圖表數據
    const data: ChartData = {
      labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
      datasets: [
        {
          label: '網站訪問',
          data: [150, 210, 180, 250, 220, 350, 380],
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: '新會員',
          data: [5, 12, 8, 15, 10, 22, 28],
          borderColor: '#f72585',
          backgroundColor: 'rgba(247, 37, 133, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    }

    // 創建圖表選項
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
        },
        y: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
          beginAtZero: true,
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    }

    // 創建圖表實例
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: data,
      options: options,
    })

    // 在銷毀組件時清理
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [isDarkMode])

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}

export function PieChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    // 如果已存在圖表，銷毀它
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // 根據主題設置顏色
    const textColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)'

    // 創建圖表數據
    const data: ChartData = {
      labels: ['直接訪問', '搜尋引擎', '社交媒體', '廣告', '其他'],
      datasets: [
        {
          data: [35, 30, 20, 10, 5],
          backgroundColor: [
            '#4361ee',
            '#4cc9f0',
            '#f72585',
            '#7209b7',
            '#3f37c9',
          ],
          borderWidth: 0,
        },
      ],
    }

    // 創建圖表選項
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.raw || 0
              const percentage = Math.round(value as number)
              return `${label}: ${percentage}%`
            },
          },
        },
      },
    }

    // 創建圖表實例
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options,
    })

    // 在銷毀組件時清理
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [isDarkMode])

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}

// 寵物類型分布圖
export function PetTypeChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    // 如果已存在圖表，銷毀它
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // 根據主題設置顏色
    const textColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)'

    // 創建圖表數據
    const data: ChartData = {
      labels: ['狗', '貓', '兔子', '小鼠', '鳥類', '其他'],
      datasets: [
        {
          data: [45, 38, 7, 4, 3, 3],
          backgroundColor: [
            '#3f37c9', // 深藍
            '#f72585', // 粉紅
            '#4cc9f0', // 淺藍
            '#7209b7', // 紫色
            '#4361ee', // 中藍
            '#560bad', // 深紫
          ],
          borderWidth: 0,
        },
      ],
    }

    // 創建圖表選項
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.raw || 0
              const percentage = Math.round(value as number)
              return `${label}: ${percentage}%`
            },
          },
        },
        title: {
          display: true,
          text: '寵物類型分布',
          color: textColor,
          font: {
            size: 16,
          },
        },
      },
    }

    // 創建圖表實例
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: options,
    })

    // 在銷毀組件時清理
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [isDarkMode])

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}

// 每月預約與領養趨勢圖
export function AdoptionTrendsChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    // 如果已存在圖表，銷毀它
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // 根據主題設置顏色
    const gridColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
    const textColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)'

    // 創建圖表數據
    const data: ChartData = {
      labels: [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ],
      datasets: [
        {
          label: '預約數量',
          data: [65, 75, 82, 78, 92, 105, 115, 110, 100, 95, 120, 135],
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: '成功領養',
          data: [30, 42, 38, 45, 55, 62, 70, 68, 60, 58, 75, 82],
          borderColor: '#f72585',
          backgroundColor: 'rgba(247, 37, 133, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    }

    // 創建圖表選項
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        title: {
          display: true,
          text: '年度領養趨勢',
          color: textColor,
          font: {
            size: 16,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
        },
        y: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
          beginAtZero: true,
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    }

    // 創建圖表實例
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: data,
      options: options,
    })

    // 在銷毀組件時清理
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [isDarkMode])

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}

// 預約狀態分布圖
export function AppointmentStatusChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!chartRef.current) return

    // 如果已存在圖表，銷毀它
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // 根據主題設置顏色
    const textColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)'

    // 創建圖表數據
    const data: ChartData = {
      labels: ['待審核', '已確認', '已完成', '已取消'],
      datasets: [
        {
          data: [25, 35, 30, 10],
          backgroundColor: [
            '#ffc107', // 待審核 - 黃色
            '#28a745', // 已確認 - 綠色
            '#17a2b8', // 已完成 - 藍綠色
            '#dc3545', // 已取消 - 紅色
          ],
          borderWidth: 0,
        },
      ],
    }

    // 創建圖表選項
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.raw || 0
              const percentage = Math.round(value as number)
              return `${label}: ${percentage}%`
            },
          },
        },
        title: {
          display: true,
          text: '預約狀態分布',
          color: textColor,
          font: {
            size: 16,
          },
        },
      },
    }

    // 創建圖表實例
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options,
    })

    // 在銷毀組件時清理
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [isDarkMode])

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}
