
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ScriptContent, ContentStatus, PostContent } from "../types";

// Função auxiliar para obter a instância da IA de forma segura
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY não encontrada nas variáveis de ambiente.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export async function generateScript(idea: string, profile: UserProfile, length: 'Curto' | 'Médio' | 'Longo'): Promise<ScriptContent> {
  const ai = getAI();
  const lengthDesc = {
    'Curto': 'menos de 30 segundos, extremamente direto e impactante',
    'Médio': '45-60 segundos, equilíbrio entre valor e detalhamento',
    'Longo': 'mais de 90 segundos, narrativa profunda com ganchos de alta retenção emocional'
  }[length];

  const prompt = `
    Você é o estrategista de conteúdo número #1 do mundo, mestre em algoritmos de retenção e psicologia do consumo rápido para Reels, TikTok e Shorts.
    
    PERFIL DO CRIADOR:
    - Nicho: ${profile.niche}
    - Tom de Voz: ${profile.tone}
    - Objetivo: ${profile.objective}
    - Duração: ${length} (${lengthDesc})

    TEMA PARA O ROTEIRO: "${idea}"

    DIRETRIZES:
    - O gancho DEVE ser uma "Interrupção de Padrão" hipnótica.
    - Estruture o conteúdo em blocos de retenção.
    - Responda em Português Brasil.

    ESTRUTURA DE SAÍDA JSON:
    - title: Título viral
    - hook: { text: "fala", action: "ação visual" }
    - development: Array de { text: "fala", action: "ação" }
    - cta: { text: "fechamento", action: "ação" }
    - tips: Array de 4 dicas
    - reachTips: Array de 3 dicas
    - nextThemes: Array de {title, reasoning}
    - durationSeconds: Tempo estimado
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: {
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING }, action: { type: Type.STRING } },
            required: ["text", "action"]
          },
          development: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { text: { type: Type.STRING }, action: { type: Type.STRING } },
              required: ["text", "action"]
            }
          },
          cta: {
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING }, action: { type: Type.STRING } },
            required: ["text", "action"]
          },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          reachTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextThemes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, reasoning: { type: Type.STRING } },
              required: ["title", "reasoning"]
            }
          },
          durationSeconds: { type: Type.INTEGER }
        },
        required: ["title", "hook", "development", "cta", "tips", "reachTips", "nextThemes", "durationSeconds"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: data.title,
    hook: data.hook,
    development: data.development,
    cta: data.cta,
    tips: data.tips,
    reachTips: data.reachTips,
    nextThemes: data.nextThemes,
    duration: data.durationSeconds,
    length: length,
    status: ContentStatus.READY,
    isUsed: false,
    createdAt: new Date().toISOString()
  };
}

export async function analyzeImageAndGenerateCaption(
  images: { data: string, mimeType: string }[], 
  profile: UserProfile, 
  userContext: string,
  isCarousel: boolean
): Promise<PostContent> {
  const ai = getAI();
  const prompt = `
    Analise ${images.length > 1 ? 'estas imagens' : 'esta imagem'} e crie uma estratégia mestre de Instagram em PORTUGUÊS BRASIL.
    NICHE: ${profile.niche}
    TOM DE VOZ: ${profile.tone}
    CONTEXTO: ${userContext}
    TIPO: ${isCarousel ? 'Carrossel' : 'Post Único'}

    Retorne JSON com title, caption, hashtags (array), musicSuggestions (array), nextImageTips (array) e slides (se carrossel).
  `;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.data.split(',')[1] || img.data,
      mimeType: img.mimeType,
    },
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [...imageParts, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          caption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          musicSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextImageTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.INTEGER },
                text: { type: Type.STRING },
                visualAdvice: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "caption", "hashtags", "musicSuggestions", "nextImageTips"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");

  return {
    id: Math.random().toString(36).substr(2, 9),
    title: data.title,
    imageUrl: images[0].data,
    imageUrls: images.map(i => i.data),
    isCarousel: isCarousel,
    slides: data.slides,
    caption: data.caption,
    hashtags: data.hashtags,
    musicSuggestions: data.musicSuggestions,
    nextImageTips: data.nextImageTips,
    status: ContentStatus.READY,
    isUsed: false,
    createdAt: new Date().toISOString()
  };
}
