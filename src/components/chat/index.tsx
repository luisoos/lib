import { MessageCircleQuestionIcon } from "lucide-react";
import { useState } from "react";
import ChatWindow from "~/components/chat/window";

export default function ChatInterface() {
    const [showChatWindow, setShowChatWindow] = useState(false);
    return (
        <>
            {showChatWindow ? <ChatWindow hide={() => setShowChatWindow} /> : 
            <div className="fixed right-2 bottom-2 bg-black rounded-md p-1 hover:scale-105 hover:shadow-lg transition-all delay-75 duration-300 cursor-pointer" onClick={() => setShowChatWindow(true)}>
                <MessageCircleQuestionIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>}
        </>
    )
}