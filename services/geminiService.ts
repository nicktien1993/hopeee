import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types.ts';

const TEXT_MODEL = 'gemini-3-flash-preview';

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  try {
    const ai = getAIInstance();
    const prompt = `請搜尋列出 ${params.year}學年度 ${params.publisher}版 國小數學 ${params.grade}${params.semester} 的單元目錄。格式：JSON 陣列。`;

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

    return JSON.parse(response.text || "[]");
  } catch (err) {
    console.error("Fetch Chapters Failed:", err);
    throw err;
  }
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `請製作特教數學講義：${params.publisher}版 ${params.grade} ${chapter} - ${subChapter}。`,
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
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateHomework = async (params: SelectionParams, chapter: string, subChapter: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `請製作隨堂卷：${chapter} - ${subChapter}。題數：${config.calculationCount + config.wordProblemCount} 題。`,
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