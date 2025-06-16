export type FreeMachine = {
  ip: string;
  port: string;
  start_time: number;
  httpPort: string;
  dns: string;
  gpuType: string;
  groupName: string;
  id: number;
  uptime: number;
  actual_status: string;
  clients_number: number;
};

export interface GetFreeMachineResponse {
  free: FreeMachine[];
  busy: FreeMachine[];
  notReady: FreeMachine[];
  notResponded: FreeMachine[];
}
