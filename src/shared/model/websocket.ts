import type { IntentResponse } from "./intents";

interface Segment {
  text: string;
  start: string;
  end: string;
}

export type TextResponse = Segment[];
export type TranslationResponse = Record<string, string>;
export type AudioResponse = {
  audio: string;
};
// Only for old version. Can be removed in future
export type AudioSegmentResponse = {
  segments: AudioResponse;
};

export type ResponseType = "agent" | "transcription";

export type ServerResponse = {
  uid: string;
  segments: TextResponse | TranslationResponse | AudioResponse | IntentResponse;
  type: ResponseType;
};
