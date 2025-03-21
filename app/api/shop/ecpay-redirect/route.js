import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('Received POST request to /api/shop/ecpay-redirect');
  try {
    const params = await request.json();
    console.log('Received params:', params);

    // 构建绿界科技的URL
    const ecpayUrl = new URL('https://logistics-stage.ecpay.com.tw/Express/map');
    Object.keys(params).forEach(key => 
      ecpayUrl.searchParams.append(key, params[key])
    );

    console.log('ECPay URL:', ecpayUrl.toString());

    return NextResponse.json({ redirectUrl: ecpayUrl.toString() });
  } catch (error) {
    console.error('Error in ecpay-redirect:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}