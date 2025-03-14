import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = params;

    try {
        // 使用測試數據供示範，實際應用中應從資料庫獲取
        const article = await getArticleById(id);
        
        if (!article) {
            return NextResponse.json({ message: '找不到文章' }, { status: 404 });
        }
        
        return NextResponse.json(article);
    } catch (error) {
        console.error('獲取文章時出錯:', error);
        return NextResponse.json({ message: '伺服器內部錯誤' }, { status: 500 });
    }
}

// 測試數據函數 - 在實際應用中應替換為數據庫查詢
async function getArticleById(id) {
    // 模擬文章數據庫
    const articles = {
        '1': {
            id: '1',
            title: '健康飲食的重要性',
            content: '# 健康飲食的重要性\n\n均衡的飲食對我們的身體健康至關重要。研究表明，良好的飲食習慣可以預防多種慢性疾病，包括心臟病、糖尿病和某些癌症。\n\n## 飲食建議\n\n- 多吃新鮮蔬果\n- 選擇全穀物食品\n- 限制加工食品和糖分攝入\n- 保持適當的蛋白質攝入\n\n正確的飲食習慣不僅能提高生活質量，還能延長壽命。',
            author: '營養專家',
            publishedAt: '2024-03-10T09:00:00Z',
            category: '健康'
        },
        '2': {
            id: '2',
            title: '旅行的十大好處',
            content: '# 旅行的好處\n\n旅行不僅能讓我們放鬆身心，還能擴展視野，豐富人生經驗。\n\n## 主要好處\n\n1. 減輕壓力\n2. 增加文化理解\n3. 創造難忘回憶\n4. 提升適應能力\n5. 增進人際關係\n\n無論是短途還是長途旅行，都能帶給我們全新的體驗和視角。',
            author: '旅行愛好者',
            publishedAt: '2024-03-05T14:30:00Z',
            category: '旅遊'
        },
        '3': {
            id: '3',
            title: '程式設計入門指南',
            content: '# 程式設計入門\n\n學習程式設計是現代社會重要的技能。本文將介紹如何開始你的程式設計之旅。\n\n## 選擇合適的程式語言\n\n- **Python**: 簡單易學，適合初學者\n- **JavaScript**: 網頁開發必備\n- **Java**: 企業應用廣泛\n\n## 學習資源\n\n- 線上課程\n- 技術書籍\n- 開源項目\n\n持之以恆的學習才能不斷提升你的程式設計能力。',
            author: '程式教育家',
            publishedAt: '2024-02-28T11:15:00Z',
            category: '技術'
        }
    };
    
    // 模擬網絡延遲
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 返回指定ID的文章，如果不存在則返回null
    return articles[id] || null;
}