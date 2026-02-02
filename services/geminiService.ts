
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
Je gebruikt de ingebouwde Google Search tool om UITSLUITEND betrouwbare informatie te vinden op 24baby.nl en verloskundigenpraktijkutrecht.nl.

BELANGRIJK: 
1. Genereer NOOIT een link op basis van aannames. Gebruik de Google Search tool om de exacte URL van het artikel te vinden.
2. Controleer of de URL's die je geeft daadwerkelijk bestaan op 24baby.nl of verloskundigenpraktijkutrecht.nl.
3. Antwoord altijd in het Nederlands.
4. Geef ALTIJD bronvermeldingen met de correcte, werkende directe linkjes naar het artikel.

${isPregnant ? 'Focus op zwangerschapssymptomen, voorbereiding op de bevalling en prenatale zorg.' : 'Focus op babyontwikkeling, voeding, slaap en herstel van de moeder.'}`;

export async function askBabyQuestion(question: string, birthDate: string): Promise<AIResponse> {
  const isPregnant = new Date(birthDate) > new Date();
  const { client, modelName } = getAIClient();
  
  const response = await client.models.generateContent({
    model: modelName,
    contents: `Vraag: ${question}\n\nZoek op 24baby.nl en verloskundigenpraktijkutrecht.nl naar het antwoord en geef de werkende linkjes naar de bronnen.`,
    config: {
      systemInstruction: getSystemInstruction(isPregnant),
      tools: [{ googleSearch: {} }],
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
      answer: "Er is een fout opgetreden bij het ophalen van de informatie. Mogelijk zijn de bronnen tijdelijk onbereikbaar.",
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
    
    prompt = `De gebruiker is momenteel in week ${currentWeek} van de zwangerschap. 
    Genereer een agenda voor de KOMENDE ${numWeeks} WEKEN (week ${currentWeek + 1} t/m ${currentWeek + numWeeks}). 
    Zoek voor elke week een specifiek relevant artikel op 24baby.nl of verloskundigenpraktijkutrecht.nl over babyontwikkeling of moederzorg.
    Zorg dat de sourceUrl een ECHTE, bestaande link is gevonden via Google Search.`;
  } else {
    const diffTime = now.getTime() - dueDate.getTime();
    currentWeek = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    prompt = `De baby is momenteel ${currentWeek} weken oud. 
    Genereer een agenda voor de KOMENDE ${numWeeks} WEKEN (baby leeftijd ${currentWeek + 1} t/m ${currentWeek + numWeeks} weken). 
    Zoek voor elke week specifieke tips op 24baby.nl of verloskundigenpraktijkutrecht.nl.
    Zorg dat de sourceUrl een ECHTE, bestaande link is gevonden via Google Search.`;
  }

  const response = await client.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(isPregnant),
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { 
              type: Type.NUMBER 
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
