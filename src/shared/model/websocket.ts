import type { IntentResponse } from "./intents";

interface Segment {
  text: string;
  start: string;
  end: string;
}

export type UserTextResponse = { current_user_text: string };
export type TextResponse = Segment[];
export type TranslationResponse = Record<string, string>;
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
    | UserTextResponse
    | TextResponse
    | TranslationResponse
    | AudioResponse
    | IntentResponse;
  type: ResponseType;
};
