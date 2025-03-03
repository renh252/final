import localFont from 'next/font/local'

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
      <body className={`${fontIansui.variable}`} style={{ fontFamily: 'var(--font-iansui)' }}>
        {children}
      </body>
    </html>
  )
}
