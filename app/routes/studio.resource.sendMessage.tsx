import { run } from "@remix-run/dev/dist/cli/run";
import { ActionFunctionArgs } from "@remix-run/node";
import { openai } from "~/lib/openai/openaiConfig";

export type AssistantResponse = {
  role: "assistant" | "user";
  message: string;
  runId: number;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // need thread id  and text from form
  const body = await request.formData();
  const threadId = body.get("threadId") as string;
  const text = body.get("text") as string;

  if (!threadId) {
    throw new Error("No threadId provided");
  }
  const threadMessages = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: text,
  });
  // textCreated - create new assistant message\

  const assistantResponse = await new Promise((resolve, reject) => {
    openai.beta.threads.runs
      .stream(threadId, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID!,
      })
      .on("textCreated", async (event) => console.log("textCreated", event))
      .on("messageDone", async (event) => {
        console.log("event", event);
        if (event.content[0].type === "text") {
          const { text } = event.content[0];
          console.log(text.value);
          resolve({
            role: "assistant",
            message: text.value,
            runId: event.run_id,
          });
        } else {
          resolve({ message: "No text response from assistant" });
        }
      })
      .on("error", reject);
  });

  return assistantResponse;
};
