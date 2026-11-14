// Configurable so a provider retirement does not require rewriting API routes.
// Gemini 2.0 Flash was shut down in 2026; use a supported stable model.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
