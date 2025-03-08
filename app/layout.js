import localFont from 'next/font/local'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import Script from 'next/script'
import LayoutWrapper from './LayoutWrapper'

const fontIansui = localFont({
  src: '../public/fonts/Iansui-Regular.ttf',
  variable: '--font-iansui',
  weight: '100 900',
})

export const metadata = {
  title: '毛孩之家',
  description:
    '這是一個寵物領養網站，旨在提供寵物領養服務，讓更多毛孩能有溫暖的家。',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-hant-tw" suppressHydrationWarning>
      <body
        className={`${fontIansui.variable}`}
        style={{
          display: 'flex',
          'flex-direction': 'column',
          minHeight: '100vh',
        }}
        suppressHydrationWarning
      >
        <LayoutWrapper>{children}</LayoutWrapper>

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
// 客戶端組件已移至 LayoutWrapper.js
