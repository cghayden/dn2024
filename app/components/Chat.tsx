import { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { useEffect, useRef, useState } from "react";
// import Markdown from "react-markdown";
import { openai } from "~/lib/openai/openaiConfig";

type MessageProps = {
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

const Message = ({ role, text }: MessageProps) => {
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const thread = await openai.beta.threads.create();
  console.log("thread", thread);
  return { threadId: thread.id };
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // create a new threadID when chat component created
  // useEffect(() => {
  //   const createThread = async () => {
  //     const res = await fetch(`/api/assistants/threads`, {
  //       method: "POST",
  //     });
  //     const data = await res.json();
  //     setThreadId(data.threadId);
  //   };
  //   createThread();
  // }, []);

  return (
    <div className="chat_chatContainer">
      <div className="chat_messages">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        // onSubmit={handleSubmit}
        className="chat_inputForm chat_clearfix"
      >
        <input
          type="text"
          className="chat_input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <button
          type="submit"
          className="chat_button"
          // disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
};
export default Chat;
