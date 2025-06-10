import { ChatInput } from "@/features/chat";
import { AiCircleIcon } from "@/shared/ui/icons/AiCircleIcon";

const ChatPage = () => {
  const handleSubmit = (prompt: string) => {
    console.log(prompt);
  };

  return (
    <div className="grid grid-rows-[1fr_auto] h-full mx-5">
      {/* AI Circle */}
      <div className="grid place-items-center">
        <AiCircleIcon />
      </div>

      {/* Chat input */}
      <ChatInput
        className="my-8"
        showPlaceholder={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export const Component = ChatPage;
