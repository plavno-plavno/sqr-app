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
  start: string;
  end: string;
  text: string;
}

export interface SegmentsResponse {
  uid: string;
  segments: Segment[];
}

export interface TranslationsResponse {
  uid: string;
  segments: Record<string, string>;
}

export type ServerResponse = SegmentsResponse | TranslationsResponse;