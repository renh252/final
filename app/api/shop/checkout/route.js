import axios from "axios";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

const APIURL = "https://logistics-stage.ecpay.com.tw/Helper/GetStoreList";

const KeyIV = {
  2000132: { HashKey: "5294y06JbISpM5x9", HashIV: "v77hoKGq4kWxNNIS" }
};

function CreateCMV(CMVparams) {
  const selectedKey = '5294y06JbISpM5x9';
  const selectedIV = 'v77hoKGq4kWxNNIS';
  
  function DotNETURLEncode(string) {
    const list = {
      "%2D": "-",
      "%5F": "_",
      "%2E": ".",
      "%21": "!",
      "%2A": "*",
      "%28": "(",
      "%29": ")",
      "%20": "+",
    };

    Object.entries(list).forEach(([encoded, decoded]) => {
      const regex = new RegExp(encoded, "g");
      string = string.replace(regex, decoded);
    });

    return string;
  }

  const Step1 = Object.keys(CMVparams)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${CMVparams[key]}`)
    .join("&");
  const Step2 = `HashKey=${selectedKey}&${Step1}&HashIV=${selectedIV}`;
  const Step3 = DotNETURLEncode(encodeURIComponent(Step2));
  const Step4 = Step3.toLowerCase();
  const Step5 = createHash("MD5").update(Step4).digest("hex");
  const Step6 = Step5.toUpperCase();

  return Step6;
}

export async function POST(request) {
  console.log('Received POST request');
  try {
    const body = await request.json();
    console.log('Request body:', body);

    if (body.action === 'createCMV') {
      const result = CreateCMV(body);
      console.log('CreateCMV result:', result);
      return NextResponse.json({ result });
    } else {
      const payload = {
        MerchantID: body.MerchantID,
        CvsType: body.CvsType,
        CheckMacValue: CreateCMV(body),
      };

      console.log('Sending payload to ECPAY:', payload);

      try {
        const ecpayResponse = await axios({
          method: 'post',
          url: APIURL,
          headers: {
            'Accept': 'text/html',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: new URLSearchParams(payload).toString()
        });
        console.log('ECPAY response received');
        return new NextResponse(ecpayResponse.data, {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error("Error calling ECPAY API:", error);
        return NextResponse.json({ error: "發生錯誤！" + error.message }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "處理請求時發生錯誤" }, { status: 500 });
  }
}