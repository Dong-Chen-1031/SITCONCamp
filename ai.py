
# To run this code you need to install the following dependencies:
# pip install google-genai

from google import genai
from google.genai import types
import os
import json

api_key = os.environ.get('GEMINI_API_KEY')

client = genai.Client(
    api_key=api_key,
)

model = "gemini-2.5-flash"

SYSTEM_PROMPT="""你是一個創意十足的 AI 食譜生成器，專門將用戶的創意料理步驟轉化為完整的食譜評估。

## 🎯 你的職責：
1. 接收用戶提供的任意料理步驟（可能包含非傳統的烹飪方式）
2. 生成一份完整的食譜評估報告
3. 對食譜進行多維度分析，包括安全性、可行性、營養價值等

## 🧠 核心理念：
- **開放式創意**：接受任何形式的料理步驟，無論多麼奇特（如：用水泥攪拌車攪拌蛋糕、用噴火龍炙燒表面）
- **幽默與專業並重**：保持創意和趣味性，同時提供實用的評估
- **安全至上**：對可能的風險進行誠實評估

## 📋 評估標準：
- **食品安全性（1-10分）**：評估食材搭配和製作過程的安全性
- **操作可行性（1-10分）**：評估步驟的實際可執行性
- **營養合理性（1-10分）**：評估營養價值和膳食平衡
- **風險評估**：客觀評估死亡風險和腹瀉風險（低/中/高）
- **腹瀉率％**：預估可能的腹瀉機率（0-100%）
- **飽食度％**：評估食物的飽腹感程度（0-100%）

## 🎨 輸出風格：
- **食譜名稱**：創意且吸引人，反映料理的獨特之處
- **料理過後的結果**：生動描述最終成品的外觀、口感、味道
- **綜合評分（1-10）**：基於安全性、可行性、創意性的整體評分
- **可改進之處**：建設性的改進建議，讓食譜更安全或更美味
- **整體總結**：簡潔有力的總結，突出食譜特色
- **生成食物照片的prompt**：詳細描述用於AI繪圖的提示詞
- **各項內容整體原因分析**：解釋各項評分的理由和依據

## ⚠️ 注意事項：
- 即使是極其奇特的料理方式，也要認真對待並給出合理評估
- 對於可能危險的步驟，要明確指出風險並提供替代方案
- 保持幽默感，但不犧牲專業性
- 鼓勵創意，但強調安全

## 📝 範例情境：
- 用戶輸入：「用水泥攪拌車攪拌蛋糕糊10分鐘」
- 你應該：創造性地解釋這個步驟，評估其可行性（可能很低），建議替代方案（工業級攪拌機），並保持輕鬆的語調

記住：你的目標是將任何瘋狂的料理想法轉化為有價值的食譜評估報告！"""

def generate(str_: str):
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=-1,
        ),
        response_mime_type="application/json",
        response_schema=types.Schema(
            type = types.Type.OBJECT,
            properties = {
                "食譜名稱": types.Schema(
                    type = types.Type.STRING,
                ),
                "料理過後的結果": types.Schema(
                    type = types.Type.STRING,
                ),
                "腹瀉率％": types.Schema(
                    type = types.Type.NUMBER,
                ),
                "飽食度％": types.Schema(
                    type = types.Type.NUMBER,
                ),
                "綜合評分（1-10）": types.Schema(
                    type = types.Type.INTEGER,
                ),
                "可改進之處": types.Schema(
                    type = types.Type.STRING,
                ),
                "整體總結": types.Schema(
                    type = types.Type.STRING,
                ),
                "生成食物照片的prompt": types.Schema(
                    type = types.Type.STRING,
                ),
                "食品安全性（1-10分）": types.Schema(
                    type = types.Type.INTEGER,
                ),
                "各項內容整體原因分析": types.Schema(
                    type = types.Type.STRING,
                ),
                "操作可行性（1-10分）": types.Schema(
                    type = types.Type.INTEGER,
                ),
                "營養合理性（1-10分）": types.Schema(
                    type = types.Type.INTEGER,
                ),
                "死亡風險評估（低/中/高）": types.Schema(
                    type = types.Type.STRING,
                    enum = ["低", "中", "高"],
                ),
                "腹瀉風險評估（低/中/高）": types.Schema(
                    type = types.Type.STRING,
                    enum = ["低", "中", "高"],
                ),
            },
        ),
        system_instruction=[
            types.Part.from_text(text=SYSTEM_PROMPT),
        ],
    )
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=str_),
            ],
        ),
    ]
    ans = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    return json.loads(ans.text)