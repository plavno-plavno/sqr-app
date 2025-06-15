export type GetFreeMachine = {
  ip: string;
  port: string;
  start_time: number;
  httpPort: string;
  dns: string;
  gpuType: string;
  id: number;
  uptime: number;
  actual_status: string;
  clients_number: number;
};

export interface Segment {
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
}

export type ResponseType = "agent" | "transcription";

export type ServerResponse = {
  uid: string;
  segments: TextResponse | TranslationResponse | AudioResponse;
  type: ResponseType;
};

