import type { OperationInfo } from "@/shared/model/intents";
import {
  PromptType,
  type ServerResponse,
  VocalizerType,
} from "@/shared/model/websocket";
// eslint-disable-next-line boundaries/element-types
import i18n from "@/app/i18n";
import { sleep } from "../js/common";

const MAX_RECONNECT_ATTEMPTS = 100;
const RECONNECT_INTERVAL = 1000;
const MAX_RECONNECT_INTERVAL = 15000;

interface WebSocketConnectionOptions {
  language: string;
  vocalizerType: VocalizerType;
  promptType: PromptType;
  intentDetection: boolean;
  isAudioEnabled: boolean;
  onReconnect?: (isReconnecting: boolean) => void;
}

export class WebSocketConnection {
  private socket: WebSocket | null = null;
  private url: string | null = null;
  private options: WebSocketConnectionOptions;
  private onResponse: ((response: ServerResponse) => void) | null = null;

  private reconnectAttempts: number = 0;
  public isReconnecting: boolean = false;

  constructor(options: WebSocketConnectionOptions) {
    this.options = options;
  }

  async initSocket(
    url: string,
    onResponse: (response: ServerResponse) => void
  ): Promise<void> {
    this.url = url;
    this.onResponse = onResponse;

    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(url);

        socket.onopen = () => {
          console.log("WebSocket connected");

          this.socket = socket;
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.options.onReconnect?.(false);

          const initData = {
            uid: "35",
            language: this.options.language,
            task: "transcribe",
            model: "large-v3",
            use_vad: true,
            isStartStream: true,
            outer_vad_trigger: true,
          };
          console.log("Sending init data:", initData);
          socket.send(JSON.stringify(initData));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Parsed message:", data);

            if (data.message === "SERVER_READY") {
              console.log("Server is ready for audio streaming");
              const { isAudioEnabled } = this.options;
              this.sendToggleAudioCommand(isAudioEnabled);
              resolve();
            } else if (data.segments) {
              // Это ответ с транскрипцией
              this.onResponse?.(data as ServerResponse);
            }
          } catch (error: unknown) {
            console.log("Raw message:", event.data);
            console.error("WebSocket error:", error);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        socket.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          this.socket = null;
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        reject(error);
      }
    });
  }

  private async reconnect() {
    this.isReconnecting = true;
    this.options.onReconnect?.(true);
    this.reconnectAttempts = 0;

    while (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;

      try {
        await this.initSocket(this.url!, this.onResponse!);
        return; // Успешное подключение
      } catch (error) {
        console.log(
          `Reconnect attempt ${this.reconnectAttempts} failed:`,
          error
        );

        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          this.isReconnecting = false;
          this.options.onReconnect?.(false);
          throw new Error(
            `Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`
          );
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, max 15s
        const delay = Math.min(
          RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1),
          MAX_RECONNECT_INTERVAL
        );

        console.log(`Waiting ${delay}ms before next reconnect attempt...`);
        await sleep(delay);
      }
    }
  }

  // eslint-disable-next-line
  private async send(packet: any) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      if (this.isReconnecting) return;
      await this.reconnect();
    }

    this.socket?.send(JSON.stringify(packet));
  }

  sendAudioData(base64Data: string, voicestop?: boolean) {
    // eslint-disable-next-line
    const packet: any = {
      speakerLang: this.options.language,
      audio: base64Data,
      isStartStream: true,
      disableSentenceCutter: true,
      returnTranslatedSegments: true,
      sameOutputThreshold: 4,
      prompt: this.options.promptType,
    };
    if (voicestop === true) packet.voicestop = true;

    if (this.socket?.readyState !== WebSocket.OPEN) {
      if (this.isReconnecting) return;
      return this.reconnect();
    }

    this.socket?.send(JSON.stringify(packet));
  }

  sendVoiceEndCommand() {
    const packet = {
      command: true,
      commandName: "trigger_voice_end",
    };
    this.send(packet);
  }

  sendTextCommand(text: string) {
    // eslint-disable-next-line
    const packet: any = {
      command: true,
      commandName: "send_text_command",
      text,
    };
    // if (voiceStop) {
    //   this.send({
    //     voicestop: true,
    //   });
    // }
    this.send(packet);
  }

  sendConfirmationCommand(operationInfo: OperationInfo) {
    const packet = {
      command: true,
      commandName: "confirm_operation",
      operation_info: operationInfo,
    };
    this.send(packet);
  }

  sendSwitchVocalizerCommand(vocalizerType: VocalizerType) {
    const packet = {
      command: true,
      commandName: "switch_vocalizer",
      vocalizer_type: vocalizerType,
    };
    this.send(packet);
  }

  sendSwitchPromptCommand(prompt: PromptType) {
    const packet = {
      command: true,
      commandName: "switch_prompt",
      prompt_set: prompt,
    };
    this.send(packet);
  }

  sendToggleIntentCommand(isEnabled: boolean) {
    const packet = {
      command: true,
      commandName: isEnabled ? "enable_intent" : "skip_intent",
    };
    this.send(packet);
  }

  sendToggleAudioCommand(isEnabled: boolean) {
    const packet = {
      command: true,
      commandName: isEnabled ? "enable_audio" : "disable_audio",
    };
    this.send(packet);
  }

  sendHelloMessage() {
    const packet = {
      command: true,
      commandName: "send_text_command",
      text: i18n.t("chat.helloMessage"),
    };
    this.send(packet);
  }

  changeLanguage(language: string) {
    this.options.language = language;
  }

  isSocketOpen() {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      this.reconnect();
      return false;
    }
    return true;
  }

  stopStreaming() {
    if (this.socket) {
      console.log("Stopping stream");
      // this.isReconnecting = true;
      this.socket.close(1000, "Stream stopped by user");
      this.socket = null;
    }
  }

  closeConnection() {
    if (this.socket) {
      console.log("Closing connection", this.socket);
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      this.socket.close(1000, "Connection closed by user");
      this.socket = null;
    }
  }
}
