import type { IntentResponse } from "./intents";

interface Segment {
  text: string;
  start: string;
  end: string;
}

export enum VocalizerType {
  HUME = "hume",
  MINIMAX = "minimax",
  ELEVENLABS = "elevenlabs",
}

export enum PromptType {
  DEFAULT = "default",
  CASUAL = "casual",
  MEDIC = "medic",
  TALENT = "talent",
  BANKING = "banking",
  FORMAL = "formal",
  MCDONALDS = "mcdonalds",
}

export type TextResponse = Segment[];
export type AudioResponse = {
  chunk_id: number;
  stream_id: number;
  audio: string;
  isLast?: boolean;
};
// Only for old version. Can be removed in future
export type AudioSegmentResponse = {
  segments: AudioResponse;
};

export type ResponseType = "agent" | "transcription";

export type ServerResponse = {
  uid: string;
  segments:
    | TextResponse
    | AudioResponse
    | IntentResponse;
  type: ResponseType;
};
