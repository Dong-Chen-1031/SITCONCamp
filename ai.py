
# To run this code you need to install the following dependencies:
# pip install google-genai

from typing import Any, Dict, List
from google import genai
from google.genai import types
import os
import json
from objprint import op

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


## 🎨 輸出內容：
- **食譜名稱(food_name)**：創意且吸引人，反映料理的獨特之處
- **料理過後的結果(final_result)**：生動描述最終成品的外觀、口感、味道
- **腹瀉率％(diarrhea_rate_percent)**：預估可能的腹瀉機率（0-100%）
- **飽食度％(satiety_percent)**：評估食物的飽腹感程度（0-100%）
- **綜合評分(overall_score)（1-10）**：基於安全性、可行性、創意性的整體評分
- **可改進之處(improvement_suggestions)**：建設性的改進建議，讓食譜更安全或更美味
- **整體總結(summary)**：簡潔有力的總結，突出食譜特色
- **生成食物照片的prompt(food_photo_prompt)**：詳細描述用於AI繪圖的提示詞，請使用英文
- **食品安全性(food_safety_score)（1-10分）**：評估食材搭配和製作過程的安全性
- **各項內容整體原因分析(reasoning)**：解釋各項評分的理由和依據
- **操作可行性(feasibility_score)（1-10分）**：評估步驟的實際可執行性
- **營養合理性(nutritional_value)（1-10分）**：評估營養價值和膳食平衡
- **死亡評估(death_risk)**：客觀評估死亡風險和腹瀉風險（低/中/高）
- **腹瀉評估(diarrhea_risk)**：客觀評估腹瀉風險（低/中/高）


## ⚠️ 注意事項：
- 另外，用戶會指定風格，請使用符合風格的輸出風格，本次的風格是：{}
- 即使是極其奇特的料理方式，也要認真對待並給出合理評估
- 對於可能危險的步驟，要明確指出風險並提供替代方案
- 保持幽默感，但不犧牲專業性
- 鼓勵創意，但強調安全

## 📝 範例情境：
- 用戶輸入：「用水泥攪拌車攪拌蛋糕糊10分鐘」
- 你應該：創造性地解釋這個步驟，評估其可行性（可能很低），建議替代方案（工業級攪拌機），並保持輕鬆的語調

記住：你的目標是將任何瘋狂的料理想法轉化為有價值的食譜評估報告！"""

def generate(str_: str, style:str="不指定"):
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=0,
        ),
        response_mime_type="application/json",
        response_schema=types.Schema(
            type = types.Type.OBJECT,
            properties = {
            "food_name": types.Schema(
                type = types.Type.STRING,
            ),
            "final_result": types.Schema(
                type = types.Type.STRING,
            ),
            "diarrhea_rate_percent": types.Schema(
                type = types.Type.NUMBER,
            ),
            "satiety_percent": types.Schema(
                type = types.Type.NUMBER,
            ),
            "overall_score": types.Schema(
                type = types.Type.INTEGER,
            ),
            "improvement_suggestions": types.Schema(
                type = types.Type.STRING,
            ),
            "summary": types.Schema(
                type = types.Type.STRING,
            ),
            "food_photo_prompt": types.Schema(
                type = types.Type.STRING,
            ),
            "food_safety_score": types.Schema(
                type = types.Type.INTEGER,
            ),
            "reasoning": types.Schema(
                type = types.Type.STRING,
            ),
            "feasibility_score": types.Schema(
                type = types.Type.INTEGER,
            ),
            "nutritional_value": types.Schema(
                type = types.Type.INTEGER,
            ),
            "death_risk": types.Schema(
                type = types.Type.STRING,
                enum = ["Low", "Medium", "High"],
            ),
            "diarrhea_risk": types.Schema(
                type = types.Type.STRING,
                enum = ["Low", "Medium", "High"],
            ),
            },
        ),
        system_instruction=[
            types.Part.from_text(text=SYSTEM_PROMPT.format(style)),
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
    op(json.loads(ans.text))
    return json.loads(ans.text)


def blocks_to_description(blocks: List[Dict[str, Any]]) -> str:
    """將積木陣列轉換為自然語言描述"""
    descriptions = []
    print(blocks)
    
    for i, block in enumerate(blocks, 1):
        if 'description' in block:
            # 自由輸入積木
            descriptions.append(f"{i}. {block['description']}")
        if 'amount' in block:
            # 食材積木
            ingredient = block.get('ingredient', '')
            amount = block.get('amount', '')
            
            desc = f"{i}. 使用 {ingredient}"
            if amount:
                desc += f" {amount}"
            
            descriptions.append(desc)
        else:
            # 結構化積木
            action = block.get('action', '')
            ingredient = block.get('ingredient', '')
            time = block.get('time', '')
            
            desc = f"{i}. {action}"
            if ingredient:
                desc += f" {ingredient}"
            if time:
                desc += f"，{time}"
            
            descriptions.append(desc)
    print('\n'.join(descriptions))
    return '\n'.join(descriptions)


def ai_ans(json_:List[Dict], style:str="不指定") -> dict:
    des = blocks_to_description(json_)
    ans = generate(des, style)
    return ans


from google import genai
import os
import base64

def generate_picture(prompt: str) -> str:
    """生成食物圖片,回傳 base64 編碼"""
    client = genai.Client(api_key=api_key)

    result = client.models.generate_images(
        model="models/imagen-4.0-generate-preview-06-06",
        prompt=prompt,
        config=dict(
            number_of_images=1,
            output_mime_type="image/jpeg",
            person_generation="ALLOW_ADULT",
            aspect_ratio="1:1",
        ),
    )

    if not result.generated_images:
        print("No images generated.")
        return

    img_bytes = result.generated_images[0].image.image_bytes
    # 把二進位圖轉成 base64 字串，前端才能顯示
    b64 = base64.b64encode(img_bytes).decode('utf-8')
    return b64

# if __name__ == "__main__":
# #     generate(
# #         """1. 使用混寧土粉製作麵團，並以水泥攪拌車攪拌10分鐘
# # 2. 將麵團放入烤箱，設定溫度為200
# # 3. 使用噴火龍炙燒表面，直到金黃色
# # 4. 最後將麵團放入果汁機，打成細膩狀糊糊
# # 5. 使用火龍果汁調味，並加入少許鹽和胡椒粉
# # 6. 最後將混合物倒入模具，冷藏30分鐘後取出，切成小塊享用
# # """)
#     generate("""
# 1. **準備紫薯泥**  
#    將紫薯蒸熟後去皮，將其捣成泥，加入少量百香果汁和蜂蜜，輕輕攪拌至混合均勻。備用。

# 2. **處理臘腸與鮮蝦**  
#    將臘腸切成極細小的粒，然後將鮮蝦切丁，放入熱鍋中，輕微煎炒至微熟，並在最後加入少量白酒和檸檬葉，繼續炒至酒精揮發。

# 3. **熬煮紅米飯**  
#    將紅米飯蒸煮至七分熟，然後在鍋中加入昆布、海藻粉和一小撮胡椒粉，繼續悶煮 5 分鐘，使米飯吸收海藻的香氣。

# 4. **紫蘇與百香果混合醬汁**  
#    將新鮮紫蘇葉放入食物處理機，加入百香果汁和一湯匙松露油，攪拌成醬，備用。

# 5. **製作燻製橄欖醬**  
#    把鹽漬橄欖剁碎，將其與少許松露油混合，並加入炙烤過的昆布粉，再加入少量白酒，繼續攪拌成糊狀。

# 6. **組合成品底層**  
#    在每個小碗底鋪上一層蒸好的紅米飯，然後將紫薯泥均勻鋪在米飯上，形成第一層基底。

# 7. **添加臘腸鮮蝦混合物**  
#    將臘腸與鮮蝦混合物放在紫薯泥層上，並撒上瑞士奶酪絲。輕輕壓實，放入預熱過的烤箱中，以 150°C 烤 5 分鐘，直到奶酪融化。

# 8. **紫蘇百香果醬裝飾**  
#    取出烤好的混合物，使用紫蘇百香果醬輕輕點綴在表面，讓醬汁渗透到每一層。

# 9. **添加櫻桃番茄與炙燒**  
#    將櫻桃番茄切半後，放在烤好的表面上，然後用炙燒槍輕輕燒烤番茄的表面，直到皮稍微裂開。

# 10. **冷卻與浸泡**  
#     在每一層表面滴上一些豆腐花，讓其與底層融合。稍微冷卻後，再撒上奇亞籽，讓它吸收餘熱並開始膨脹。

# 11. **最終調味與裝飾**  
#     最後，將一小撮人參花蜜撒在每道料理上，增添獨特香氣和甜味。可以選擇用新鮮紫蘇葉裝飾，讓視覺與味覺完美結合。

# 12. **享用**  
#     完成後，享用這道極具挑戰的料理，細細品味每一層次的風味。
#              """)


if __name__ == "__main__":
    generate_picture()
