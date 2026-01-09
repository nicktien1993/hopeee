import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types.ts';

const TEXT_MODEL = 'gemini-3-flash-preview';

const getAIInstance = () => {
  // 安全地獲取 API KEY，優先順序：系統注入的 process.env.API_KEY > window.process.env
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                 (window as any).process?.env?.API_KEY;
                 
  if (!apiKey) {
    console.warn("警告：未偵測到 API_KEY，部分功能可能無法運作。");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  try {
    const ai = getAIInstance();
    const prompt = `請搜尋列出 ${params.year}學年度 ${params.publisher}版 國小數學 ${params.grade}${params.semester} 的單元目錄。請務必包含每一單元的小節名稱。格式：JSON 陣列。`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "章節編號，如 1, 2" },
              title: { type: Type.STRING, description: "章節大標題" },
              subChapters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "此章節內的所有小節名稱" }
            },
            required: ["id", "title", "subChapters"]
          }
        }
      }
    });

    if (!response.text) return [];
    const text = response.text.trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Fetch Chapters Failed:", err);
    throw err;
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `請針對 ${params.grade} 資源班學生，製作一份關於「${chapter} - ${subChapter}」的數學講義。請確保內容簡單易懂，並附帶一個與題目相關的簡單數學幾何圖形 SVG 程式碼。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING, description: "核心觀念解釋，字體要大且直覺" },
          visualAidSvg: { type: Type.STRING, description: "包含一個符合教學內容的 SVG 程式碼，寬度 100%，高度自適應" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING }
              }
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              }
            }
          },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "concept", "examples", "exercises", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateHomework = async (params: SelectionParams, chapter: string, subChapter: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `請製作隨堂練習卷：${chapter} - ${subChapter}。總共題數：${config.calculationCount + config.wordProblemCount} 題。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["計算題", "應用題"] },
                content: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING }
              }
            }
          },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "questions", "checklist"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};