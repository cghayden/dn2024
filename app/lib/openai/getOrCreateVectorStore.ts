import { Assistant } from "openai/resources/beta/assistants";
import { openai } from "./openaiConfig";

const getOrCreateVectorStore = async ({
  assistant,
  userName,
}: {
  assistant: Assistant;
  userName?: string;
}) => {
  // const assistantId = process.env.OPENAI_ASSISTANT_ID!;
  // const assistant = await openai.beta.assistants.retrieve(assistantId);

  // if the assistant already has a vector store, return it
  if (assistant.tool_resources?.file_search?.vector_store_ids?.[0]) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  // otherwise, create a new vector store and attach it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: `${userName}-vector-store`,
  });
  await openai.beta.assistants.update(assistant.id, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};

export { getOrCreateVectorStore };
