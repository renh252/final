import localFont from 'next/font/local'
import Menubar from './_components/menubar'
import Footer from './_components/footer'

const fontIansui = localFont({
  src: '../public/fonts/Iansui-Regular.ttf',
  variable: '--font-iansui',
  weight: '100 900',
})

export const metadata = {
  title: '毛孩之家',
  description: '寵物網站描述',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-hant-tw">
      <body
        className={`${fontIansui.variable}`}
        style={{
          fontFamily: 'var(--font-iansui)',
          'background-color': 'rgba(240, 236, 214, 1)',
          display: 'flex',
          'flex-direction': 'column',
          minHeight: '100vh', // 確保 body 佔滿整個視窗
        }}
      >
        <Menubar />
        {/* 設置 children 為 flex: 1 以讓它填滿剩餘的空間 */}
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  )
}
