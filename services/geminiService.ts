
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ScriptContent, ContentStatus, PostContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateScript(idea: string, profile: UserProfile, length: 'Curto' | 'Médio' | 'Longo'): Promise<ScriptContent> {
  const lengthDesc = {
    'Curto': 'menos de 30 segundos, extremamente direto e impactante',
    'Médio': '45-60 segundos, equilíbrio entre valor e detalhamento',
    'Longo': 'mais de 90 segundos, narrativa profunda com ganchos de alta retenção emocional'
  }[length];

  const prompt = `
    Você é o estrategista de conteúdo número #1 do mundo, mestre em algoritmos de retenção e psicologia do consumo rápido para Reels, TikTok e Shorts.
    
    PERFIL DO CRIADOR:
    - Nicho: ${profile.niche}
    - Tom de Voz: ${profile.tone} (Mantenha este tom, mas eleve o impacto no início)
    - Objetivo: ${profile.objective}
    - Duração: ${length} (${lengthDesc})

    TEMA PARA O ROTEIRO: "${idea}"

    DIRETRIZES CRÍTICAS PARA O GANCHO (HOOK):
    O gancho DEVE ser uma "Interrupção de Padrão" hipnótica. Você tem 1.5 segundos para impedir que o dedo do usuário role a tela.
    Use OBRIGATORIAMENTE uma destas fórmulas psicológicas agressivas:
    1. **O Negativo Chocante:** "Pare de fazer [Ação Comum] agora mesmo se você não quiser [Desastre no Nicho]."
    2. **O Segredo Proibido:** "Eles não querem que você saiba disso, mas esta é a única forma de [Resultado] em ${profile.niche}."
    3. **O Atalho do 1%:** "Eu analisei os maiores de ${profile.niche} e descobri que todos eles fazem EXATAMENTE isto..."
    4. **A Mentira Exposta:** "Tudo o que te falaram sobre [Assunto] é mentira e eu vou te provar em 30 segundos."
    5. **O Desafio à Lógica:** "Como eu consegui [Resultado Positivo] fazendo o EXATO OPOSTO do que todos recomendam."

    O gancho deve ser CURTO (máximo 1 frase), DIRETO e CARREGADO DE EMOÇÃO.

    SUA TAREFA:
    - Crie um título magnético.
    - Estruture o Hook Visceral com uma ação física de impacto (ex: jogar algo, apontar fixo, sussurrar perto da lente).
    - Desenvolva o conteúdo em 3-4 blocos de "Open Loops" (cada bloco deve abrir uma dúvida que o próximo fecha).
    - Finalize com um CTA (Call to Action) que não peça apenas o like, mas que direcione a uma ação estratégica baseada no objetivo: ${profile.objective}.
    - Inclua dicas de gravação para maximizar a retenção visual.

    RESPONDA EM PORTUGUÊS BRASIL.

    ESTRUTURA DE SAÍDA JSON:
    - title: Título viral
    - hook: { text: "gancho visceral", action: "ação visual de interrupção de padrão" }
    - development: Array de { text: "fala", action: "gesto/corte" }
    - cta: { text: "fechamento estratégico", action: "gesto final" }
    - tips: Array de 4 dicas de gravação
    - reachTips: Array de 3 dicas de alcance (ex: hora de postar, uso de legendas dinâmicas)
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
              properties: {
                title: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              },
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
  const prompt = `
    Analise ${images.length > 1 ? 'estas imagens' : 'esta imagem'} e crie uma estratégia mestre de Instagram em PORTUGUÊS BRASIL.
    NICHE: ${profile.niche}
    TOM DE VOZ DETALHADO: ${profile.tone}
    CONTEXTO DO USUÁRIO: ${userContext}
    TIPO DE POST: ${isCarousel ? 'Carrossel Estratégico' : 'Post de Imagem Única'}

    DIRETRIZES:
    - Se for Carrossel, você deve criar um roteiro slide a slide (máximo 10 slides). Cada slide deve ter um texto curto e impactante e um conselho visual.
    - O Hook (primeira linha da legenda) deve ser uma interrupção de padrão hipnótica.

    Retorne JSON com:
    1. title: Título do post.
    2. caption: Legenda viral completa.
    3. hashtags: 15 Hashtags estratégicas.
    4. musicSuggestions: 3 Sugestões de músicas/áudios.
    5. nextImageTips: 2 Dicas para a próxima postagem.
    6. slides (opcional, obrigatório se for carrossel): Array de { slideNumber, text, visualAdvice }.
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
              },
              required: ["slideNumber", "text", "visualAdvice"]
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
