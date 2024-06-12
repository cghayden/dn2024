import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { useEffect, useRef, useState } from "react";
import { openai } from "~/lib/openai/openaiConfig";
import { AssistantStream } from "openai/lib/AssistantStream";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
type Message = {
  role: "user" | "assistant" | "code";
  text: string;
};
const UserMessage = ({ text }: { text: string }) => {
  return <div className="chat_userMessage">{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className="chat_assistantMessage">
      <p>{text}</p>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className="chat_codeMessage">
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: Message) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall,
  ) => Promise<string>;
};

export type LoaderData = {
  threadId: string;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const fetcher = useFetcher({ key: "sendMessage" });
  const { threadId } = useLoaderData<LoaderData>();

  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (fetcher.data?.role === "assistant") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: fetcher.data.message },
      ]);
      setInputDisabled(false);
    }
  }, [fetcher.data]);

  function submitFetcher() {
    const body = new FormData();
    body.append("threadId", threadId);
    body.append("text", userInput);
    fetcher.submit(body, {
      method: "POST",
      action: "/studio/resource/sendMessage",
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    submitFetcher();
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  return (
    <div className="chat_chatContainer">
      <div className="chat_messages">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <fetcher.Form
        id="userInput"
        className="chat_inputForm chat_clearfix"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="threadId" value={threadId} />
        <input
          name="text"
          type="text"
          className="chat_input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <button
          type="submit"
          className="chat_button"
          form="userInput"
          // disabled={inputDisabled}
        >
          Send
        </button>
      </fetcher.Form>
    </div>
  );
};
export default Chat;
