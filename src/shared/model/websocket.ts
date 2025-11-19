import type { IntentResponse } from "./intents";

interface Segment {
  text: string;
  start: string;
  end: string;
}

export const SameOutputTreshholdValues = [1, 2, 3, 4, 5];

export enum VocalizerType {
  HUME = "hume",
  KANI = "kani",
  ELEVENLABS = "elevenlabs",
}

export enum PromptType {
  DEFAULT = "default",
  SECURITY = "security",
  FINANCE = "finance",
  LOGISTICS = "logistics",
  MCDONALDS = "mcdonalds",
  MEDIC = "medic",
  SEFAR = "sefar",
  TALENT = "talent",
  LAYWER = "laywer",
  HOTEL = "hotel",
  SALES_PRACTICE = "sales_practice",
}

export type TextResponse = Segment[];
export type AudioResponse = {
  chunk_id: number;
  stream_id: number;
  audio: string | null;
  format: "raw" | "mp3";
  sampleRate?: number;
  isLast?: boolean;
};
// Only for old version. Can be removed in future
export type AudioSegmentResponse = {
  segments: AudioResponse;
};

export type ResponseType = "agent" | "transcription";

export type ServerResponse = {
  uid: string;
  segments: TextResponse | AudioResponse | IntentResponse;
  type: ResponseType;
};
