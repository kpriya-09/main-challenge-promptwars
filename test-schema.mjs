import { GoogleGenAI, Type } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const schema = {
      type: Type.OBJECT,
      properties: {
        recommendation: { type: Type.STRING, enum: ['proceed', 'proceed_with_caution', 'delay', 'avoid'] },
        summary: { type: Type.STRING },
        routeConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
        packingList: { type: Type.ARRAY, items: { type: Type.STRING } },
        alternateSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['recommendation', 'summary', 'routeConcerns', 'packingList', 'alternateSuggestions']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Write a travel advisory for a trip to Mumbai.',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    console.log(response.text);
  } catch (err) {
    console.error('Error generating advisory:', err);
  }
}
test();
