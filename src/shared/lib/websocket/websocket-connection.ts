import type { OperationInfo } from "@/shared/model/intents";
import {
  PromptType,
  type ServerResponse,
  VocalizerType,
} from "@/shared/model/websocket";

export class WebSocketConnection {
  #socket: WebSocket | null = null;
  #isServerReady: boolean = false;
  #onResponse: ((response: ServerResponse) => void) | null = null;
  #language: string;
  #prompt: string;
  #url: string | null = null;

  constructor(language: string, prompt: string) {
    this.#language = language;
    this.#prompt = prompt;
  }

  updateLanguage(language: string) {
    this.#language = language;
    if (this.#url) {
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.#socket) {
      this.#socket.close();
      this.#socket = null;
    }
    this.#isServerReady = false;
    this.initSocket(this.#url!, this.#onResponse!);
  }

  async initSocket(
    url: string,
    onResponse: (response: ServerResponse) => void
  ): Promise<void> {
    this.#onResponse = onResponse;
    this.#url = url;

    return new Promise((resolve, reject) => {
      try {
        this.#socket = new WebSocket(url);

        this.#socket.onopen = () => {
          console.log("WebSocket connected");
          const initData = {
            uid: "35",
            language: this.#language,
            task: "transcribe",
            model: "large-v3",
            use_vad: true,
            isStartStream: true,
            outer_vad_trigger: true,
          };
          console.log("Sending init data:", initData);
          this.#socket?.send(JSON.stringify(initData));
        };

        this.#socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Parsed message:", data);

            if (data.message === "SERVER_READY") {
              console.log("Server is ready for audio streaming");
              this.#isServerReady = true;
              // TODO: Remove this after server fix
              this.sendSwitchPromptCommand(PromptType.DEFAULT);
              resolve();
            } else if (data.segments) {
              // Это ответ с транскрипцией
              this.#onResponse?.(data as ServerResponse);
            }
          } catch (error: unknown) {
            console.log("Raw message:", event.data);
            console.error("WebSocket error:", error);
          }
        };

        this.#socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.#socket.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          // Не сбрасываем isServerReady при закрытии, если это было нормальное закрытие
          if (event.code !== 1000) {
            this.#isServerReady = false;
          }
          this.#socket = null;
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        reject(error);
      }
    });
  }

  // eslint-disable-next-line
  private send(packet: any) {
    console.log("this.#socket?.readyState", this.#socket?.readyState);

    if (this.#socket?.readyState !== WebSocket.OPEN)
      throw new Error("Socket is not open");
    if (!this.#isServerReady) throw new Error("Socket not ready");

    this.#socket?.send(JSON.stringify(packet));
  }

  sendAudioData(base64Data: string, voicestop?: boolean) {
    // eslint-disable-next-line
    const packet: any = {
      speakerLang: this.#language,
      audio: base64Data,
      isStartStream: true,
      disableSentenceCutter: true,
      returnTranslatedSegments: true,
      sameOutputThreshold: 4,
      prompt: this.#prompt,
    };
    if (voicestop === true) packet.voicestop = true;
    this.send(packet);
  }

  sendVoiceEndCommand() {
    const packet = {
      command: true,
      commandName: "trigger_voice_end",
    };
    this.send(packet);
  }

  sendTextCommand(text: string) {
    const packet = {
      command: true,
      commandName: "send_text_command",
      text,
    };
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

  stopStreaming() {
    if (this.#socket) {
      console.log("Stopping stream");
      // this.#isReconnecting = true;
      this.#isServerReady = false;
      this.#socket.close(1000, "Stream stopped by user");
      this.#socket = null;
    }
  }

  closeConnection() {
    if (this.#socket) {
      console.log("Closing connection", this.#socket);
      this.#socket.close(1000, "Connection closed by user");
      this.#socket = null;
      this.#isServerReady = false;
    }
  }

  isReady(): boolean {
    return this.#isServerReady;
  }
}
