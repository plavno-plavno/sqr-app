import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons";
import { Button } from "antd";
import s from "./styles.module.scss";

interface MicrophoneButtonProps {
  isRecording: boolean;
  isLoading: boolean;
  handleClick: () => void;
}

export const MicrophoneButton = ({
  isRecording,
  isLoading,
  handleClick,
}: MicrophoneButtonProps) => {
  return (
    <div className={s.container}>
      {/* {`${audioManagerRef?.current?.speechDuration}`} */}
      {/* {audioManagerRef?.current?.isVoiceActive ? <h1>Voice is active</h1> : <h1>Voice is not active</h1>} */}
      <Button
        size="large"
        shape="circle"
        className={isRecording ? s.mic_button_recording : s.mic_button_mute}
        onClick={handleClick}
        type={isRecording ? "primary" : "default"}
        danger={isRecording}
        icon={isRecording ? <AudioOutlined /> : <AudioMutedOutlined />}
        loading={isLoading}
      />
    </div>
  );
};
