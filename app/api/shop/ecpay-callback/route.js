import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('Received POST request to /api/shop/ecpay-callback')
  try {
    const formData = await request.formData()
    console.log('Form data:', Object.fromEntries(formData))

    const CVSStoreID = formData.get('CVSStoreID')
    const CVSStoreName = formData.get('CVSStoreName')
    const CVSAddress = formData.get('CVSAddress')

    console.log('Extracted data:', { CVSStoreID, CVSStoreName, CVSAddress })

    // 使用当前请求的 URL 作为基础 URL
    const baseUrl =
      request.headers.get('x-forwarded-host') || request.headers.get('host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    console.log('Using base URL:', `${protocol}://${baseUrl}`)

    // 构建重定向URL
    const redirectUrl = new URL(`/shop/checkout`, `${protocol}://${baseUrl}`)
    redirectUrl.searchParams.append('CVSStoreID', CVSStoreID)
    redirectUrl.searchParams.append('CVSStoreName', CVSStoreName)
    redirectUrl.searchParams.append('CVSAddress', CVSAddress)

    console.log('Redirect URL:', redirectUrl.toString())

    return NextResponse.redirect(redirectUrl.toString(), { status: 303 })
  } catch (error) {
    console.error('Error in ecpay-callback:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  console.log('Received GET request to /api/shop/ecpay-callback')
  return new Response('OK', { status: 200 })
}
