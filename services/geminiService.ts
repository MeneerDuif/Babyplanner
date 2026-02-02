
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, AgendaEvent } from "../types";

const getAIClient = () => {
  const savedSettings = localStorage.getItem('baby_settings');
  let apiKey = process.env.API_KEY || '';
  let model = 'gemini-3-flash-preview';

  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    if (settings.apiKey) apiKey = settings.apiKey;
    if (settings.preferredModel) model = settings.preferredModel;
  }

  return {
    client: new GoogleGenAI({ apiKey }),
    modelName: model
  };
};

const getSystemInstruction = (isPregnant: boolean) => `Je bent een gespecialiseerde AI-assistent voor ${isPregnant ? 'zwangerschap en voorbereiding op de baby' : 'baby-informatie en kraamtijd'}. 
Je gebruikt UITSLUITEND betrouwbare Nederlandse bronnen, met name 24baby.nl en https://www.verloskundigenpraktijkutrecht.nl/tips.html.
Geef ALTIJD bronvermeldingen met titels en directe linkjes.
Antwoord altijd in het Nederlands.
${isPregnant ? 'Focus op zwangerschapssymptomen, voorbereiding op de bevalling en prenatale zorg.' : 'Focus op babyontwikkeling, voeding, slaap en herstel van de moeder.'}
Als je een vraag krijgt waarvoor geen informatie beschikbaar is bij deze bronnen, geef dat dan eerlijk aan en adviseer contact op te nemen met een verloskundige of consultatiebureau.`;

export async function askBabyQuestion(question: string, birthDate: string): Promise<AIResponse> {
  const isPregnant = new Date(birthDate) > new Date();
  const { client, modelName } = getAIClient();
  
  const response = await client.models.generateContent({
    model: modelName,
    contents: question,
    config: {
      systemInstruction: getSystemInstruction(isPregnant),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "url"]
            }
          }
        },
        required: ["answer", "sources"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      answer: "Er is een fout opgetreden bij het ophalen van de informatie.",
      sources: []
    };
  }
}

export async function generateAgenda(birthDate: string, numWeeks: number = 4): Promise<AgendaEvent[]> {
  const dueDate = new Date(birthDate);
  const now = new Date();
  const isPregnant = dueDate > now;
  const { client, modelName } = getAIClient();
  
  let currentWeek = 0;
  let prompt = "";

  if (isPregnant) {
    const diffTime = dueDate.getTime() - now.getTime();
    const weeksRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    currentWeek = Math.max(1, 40 - weeksRemaining);
    
    prompt = `De gebruiker is momenteel in week ${currentWeek} van de zwangerschap (uitgerekend op ${birthDate.split('T')[0]}). 
    Genereer een agenda voor de KOMENDE ${numWeeks} WEKEN. 
    Lijst de weken op van week ${currentWeek + 1} tot en met week ${currentWeek + numWeeks}. 
    Geef per week de belangrijkste ontwikkelingen van de baby, symptomen voor de moeder en to-do's gebaseerd op de Nederlandse richtlijnen.
    Bronnen: 24baby.nl en verloskundigenpraktijkutrecht.nl.`;
  } else {
    const diffTime = now.getTime() - dueDate.getTime();
    currentWeek = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    prompt = `De baby is momenteel ${currentWeek} weken oud (geboren op ${birthDate.split('T')[0]}). 
    Genereer een agenda voor de KOMENDE ${numWeeks} WEKEN (wanneer de baby ${currentWeek + 1} tot ${currentWeek + numWeeks} weken oud is). 
    Geef per week tips over voeding, slaapritme, mijlpalen en zorg voor de baby en het herstel van de moeder.
    Bronnen: 24baby.nl en verloskundigenpraktijkutrecht.nl.`;
  }

  const response = await client.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(isPregnant),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { 
              type: Type.NUMBER, 
              description: isPregnant ? "De week van de zwangerschap" : "De leeftijd van de baby in weken" 
            },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            source: { type: Type.STRING },
            sourceUrl: { type: Type.STRING }
          },
          required: ["week", "title", "description", "source", "sourceUrl"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.sort((a: AgendaEvent, b: AgendaEvent) => a.week - b.week);
  } catch (e) {
    console.error("Failed to parse agenda response", e);
    return [];
  }
}
