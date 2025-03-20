import localFont from 'next/font/local'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import Script from 'next/script'
import LayoutWrapper from './LayoutWrapper'
import { AuthProvider } from './context/AuthContext';

const fontIansui = localFont({
  src: '../public/fonts/Iansui-Regular.ttf',
  variable: '--font-iansui',
  weight: '100 900',
  display: 'swap',
  preload: true,
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
})

export const metadata = {
  title: '毛孩之家',
  description:
    '這是一個寵物領養網站，旨在提供寵物領養服務，讓更多毛孩能有溫暖的家。',
}

// 客戶端組件已移至 LayoutWrapper.js
export default function RootLayout({ children }) {
  console.log('AuthProvider rendered'); // 添加此行
  return (
    <html lang="zh-hant-tw" suppressHydrationWarning>
      <body
        className={`${fontIansui.variable}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}