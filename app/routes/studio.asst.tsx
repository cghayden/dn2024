import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import OpenAI from "openai";

export async function loader({ request }: LoaderFunctionArgs) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const messages = [
    {
      role: "system",
      content:
        "you are a dance studio owner office assistant.  I am the owner of the studio and I will be asking you questions about the studio. I will also be asking you to perform tasks for me related to the studio.",
    },
    {
      role: "user",
      content: "What is a good slogan for the studio?",
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });
  console.log("response", response);

  return response.choices[0].message.content;
}

export default function StudioAssistant() {
  const data = useLoaderData();
  console.log("data", data);
  return (
    <div>
      <h1>Studio Assistant</h1>
    </div>
  );
}
