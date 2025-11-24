export const MODEL_NAMES = {
  STRATEGY: 'gemini-3-pro-preview',
  LOGO_GEN: 'gemini-3-pro-image-preview',
  IMAGE_EDIT: 'gemini-2.5-flash-image', // Nano Banana
  CHAT: 'gemini-3-pro-preview',
  RESEARCH: 'gemini-2.5-flash',
  ANALYSIS: 'gemini-3-pro-preview',
  FAST_RESPONSE: 'gemini-2.5-flash-lite'
};

export const DEFAULT_ASPECT_RATIO = '1:1';
export const DEFAULT_IMAGE_SIZE = '1K';

export const IMAGE_GENERATION_MODELS = [
  { id: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (High Quality)' },
  { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (Fastest)' },
];