import { Type } from '@google/genai';

const CHECKLIST_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    item: { type: Type.STRING },
    reason: { type: Type.STRING },
    priority: { type: Type.STRING, enum: ['critical', 'recommended', 'optional'] }
  },
  required: ['item', 'reason', 'priority']
};

export const PREPAREDNESS_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    riskLevel: { type: Type.STRING, enum: ['low', 'moderate', 'high', 'severe'] },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
    emergencyChecklist: { type: Type.ARRAY, items: CHECKLIST_ITEM_SCHEMA },
    documentsToSecure: { type: Type.ARRAY, items: { type: Type.STRING } },
    homeSafetyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    healthPrecautions: { type: Type.ARRAY, items: { type: Type.STRING } },
    evacuationGuidance: { type: Type.STRING },
    emergencyContactsToSave: { type: Type.ARRAY, items: { type: Type.STRING } },
    vulnerableMembersNotes: { type: Type.STRING }
  },
  required: [
    'summary',
    'riskLevel',
    'assumptions',
    'immediateActions',
    'emergencyChecklist',
    'documentsToSecure',
    'homeSafetyTips',
    'healthPrecautions',
    'evacuationGuidance',
    'emergencyContactsToSave'
  ]
};
