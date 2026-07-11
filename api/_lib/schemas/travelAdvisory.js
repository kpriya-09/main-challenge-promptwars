import { Type } from '@google/genai';

export const TRAVEL_ADVISORY_SCHEMA = {
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
