export type GetFreeMachine = {
  ip: string
  port: string
  start_time: number
  httpPort: string
  dns: string
  gpuType: string
  id: number
  uptime: number
  actual_status: string
  clients_number: number
}

export interface Segment {
  text: string;
  start: string;
  end: string;
}

export interface TextResponse {
  segments: Segment[];
}

export interface TranslationResponse {
  segments: Record<string, string>;
}

export interface AudioResponse {
  segments: {
    audio: string;
  };
}

export type ServerResponse = TextResponse | TranslationResponse | AudioResponse;
