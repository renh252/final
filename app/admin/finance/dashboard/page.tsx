'use client'

import { useState } from 'react'
import { Row, Col, Table, Form } from 'react-bootstrap'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useTheme } from '@/app/admin/ThemeContext'
import AdminPageLayout, {
  AdminSection,
  AdminCard,
} from '@/app/admin/_components/AdminPageLayout'
import {
  DollarSign,
  TrendingDown,
  Heart,
  PieChart as PieChartIcon,
} from 'lucide-react'

// 模擬數據
const MOCK_MONTHLY_REVENUE = [
  { month: '1月', revenue: 125000, expenses: 98000, donations: 45000 },
  { month: '2月', revenue: 148000, expenses: 102000, donations: 52000 },
  { month: '3月', revenue: 155000, expenses: 110000, donations: 48000 },
  { month: '4月', revenue: 168000, expenses: 115000, donations: 55000 },
  { month: '5月', revenue: 172000, expenses: 118000, donations: 58000 },
  { month: '6月', revenue: 180000, expenses: 125000, donations: 62000 },
]

const MOCK_REVENUE_SOURCES = [
  { name: '商品銷售', value: 450000 },
  { name: '寵物認養', value: 280000 },
  { name: '捐款收入', value: 320000 },
  { name: '其他收入', value: 150000 },
]

const MOCK_RECENT_TRANSACTIONS = [
  {
    id: 1,
    date: '2024-03-15',
    type: '商品銷售',
    description: '寵物食品訂單 #12345',
    amount: 2500,
    status: 'completed',
  },
  {
    id: 2,
    date: '2024-03-14',
    type: '捐款',
    description: '每月定期捐款 - 張小明',
    amount: 1000,
    status: 'completed',
  },
  {
    id: 3,
    date: '2024-03-14',
    type: '認養費用',
    description: '認養費用 - 黃金獵犬小白',
    amount: 3500,
    status: 'completed',
  },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function FinanceDashboardPage() {
  const [timeRange, setTimeRange] = useState('month')
  const { isDarkMode } = useTheme()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // 統計卡片資料
  const financeStats = [
    {
      title: '總收入',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">{formatCurrency(1200000)}</div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 12.5% 較上月
          </div>
        </div>
      ),
      color: 'primary',
      icon: <DollarSign size={24} />,
    },
    {
      title: '總支出',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">{formatCurrency(668000)}</div>
          <div className="dashboard-stat-badge text-bg-danger">
            ↑ 8.2% 較上月
          </div>
        </div>
      ),
      color: 'danger',
      icon: <TrendingDown size={24} />,
    },
    {
      title: '捐款收入',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">{formatCurrency(320000)}</div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 15.3% 較上月
          </div>
        </div>
      ),
      color: 'success',
      icon: <Heart size={24} />,
    },
    {
      title: '淨收入',
      count: (
        <div className="dashboard-stat-wrapper">
          <div className="dashboard-stat-value">{formatCurrency(532000)}</div>
          <div className="dashboard-stat-badge text-bg-success">
            ↑ 18.7% 較上月
          </div>
        </div>
      ),
      color: 'warning',
      icon: <PieChartIcon size={24} />,
    },
  ]

  return (
    <AdminPageLayout
      title="財務儀表板"
      stats={financeStats}
      actions={
        <Form.Select
          style={{ width: 'auto' }}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">本週</option>
          <option value="month">本月</option>
          <option value="quarter">本季</option>
          <option value="year">本年</option>
        </Form.Select>
      }
    >
      <div className="admin-layout-container">
        <AdminSection title="收支趨勢分析">
          <Row className="mb-4">
            <Col md={8}>
              <AdminCard title="收入支出趨勢">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_MONTHLY_REVENUE}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="收入"
                        stroke="#0088FE"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="支出"
                        stroke="#FF8042"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="donations"
                        name="捐款"
                        stroke="#00C49F"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AdminCard>
            </Col>
            <Col md={4}>
              <AdminCard title="收入來源分布">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_REVENUE_SOURCES}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                          name,
                        }) => {
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5
                          const x =
                            cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                          const y =
                            cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                          return (
                            <text
                              x={x}
                              y={y}
                              fill={isDarkMode ? 'white' : 'black'}
                              textAnchor={x > cx ? 'start' : 'end'}
                              dominantBaseline="central"
                            >
                              {`${name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                          )
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {MOCK_REVENUE_SOURCES.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AdminCard>
            </Col>
          </Row>
        </AdminSection>

        <AdminSection title="最近交易">
          <Row>
            <Col md={12}>
              <AdminCard>
                <Table responsive className={isDarkMode ? 'table-dark' : ''}>
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>類型</th>
                      <th>描述</th>
                      <th>金額</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RECENT_TRANSACTIONS.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.date}</td>
                        <td>{transaction.type}</td>
                        <td>{transaction.description}</td>
                        <td>{formatCurrency(transaction.amount)}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              transaction.status === 'completed'
                                ? 'success'
                                : 'warning'
                            }`}
                          >
                            {transaction.status === 'completed'
                              ? '已完成'
                              : '處理中'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </AdminCard>
            </Col>
          </Row>
        </AdminSection>
      </div>
    </AdminPageLayout>
  )
}
