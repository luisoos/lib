
"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { continueConversation, Message } from "~/server/ai";
import { readStreamableValue } from "ai/rsc";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "~/hooks/utils";
import { Textarea } from "../ui/textarea";

export default function ChatWindow({ hide }: { hide: () => Dispatch<SetStateAction<boolean>> }) {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  let Text = input.length >= 15 ? Textarea : Input;

  useEffect(() => {
    const textarea = document.getElementById("textarea");
    if (textarea) {
      textarea.focus();
      // TODO: If the user is not at the end of a text, but in the middle, this will hurt the user experience.
      (textarea as HTMLTextAreaElement).setSelectionRange(input.length, input.length);
    }
  }, [Text]);

  return (
    <div className="z-50 rounded border shadow-inner fixed max-lg:w-10/12 right-4 max-lg:top-4 bottom-4 md:w-1/3 xl:w-1/4 lg:max-w-2xl m-4 h-full lg:h-5/6 lg:max-h-[600px] bg-white p-4">
      <div className="h-full">
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div className={cn("absolute bottom-5 flex gap-2", input.length >= 15 && "flex-col w-full h-full")}>
        <Text
          value={input}
          id="textarea"
          className={input.length >= 15 ? "resize-none min-h-32 h-auto" : ''}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
        <Button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation([
              ...conversation,
              { role: "user", content: input },
            ]);

            let textContent = "";

            for await (const delta of readStreamableValue(newMessage)) {
              textContent = `${textContent}${delta}`;

              setConversation([
                ...messages,
                { role: "assistant", content: textContent },
              ]);
            }
          }}
        >
          Send Message
        </Button>
      </div>
    </div>
  );
}
