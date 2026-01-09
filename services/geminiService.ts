import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types.ts';

const TEXT_MODEL = 'gemini-3-flash-preview';

const getAI = () => {
  const apiKey = (process.env.API_KEY || (window as any).process?.env?.API_KEY);
  if (!apiKey) throw new Error("請先設定 API 金鑰");
  return new GoogleGenAI({ apiKey });
};

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = getAI();
  const prompt = `請搜尋列出 ${params.year}學年度 ${params.publisher}版 國小數學 ${params.grade}${params.semester} 的單元目錄。格式為 JSON 陣列。務必包含小節名稱。`;

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
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subChapters: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "subChapters"]
        }
      }
    }
  });

  const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];
  const chapters: Chapter[] = JSON.parse(response.text || "[]");
  
  // 將搜尋來源附加到章節中
  return chapters.map(c => ({ ...c, sourceUrls: urls }));
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `請針對 ${params.grade} 資源班學生（特教生，需要簡單步驟與清晰排版），製作關於「${chapter} - ${subChapter}」的數學講義。包含核心觀念、2個分步例題、2個練習題、一個簡單數學相關 SVG 圖形。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING },
          visualAidSvg: { type: Type.STRING },
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `製作隨堂卷：${chapter} - ${subChapter}。總共題數：${config.calculationCount + config.wordProblemCount} 題。`,
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
                type: { type: Type.STRING },
                content: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING }
              }
            }
          },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};