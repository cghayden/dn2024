import { prisma } from "~/db.server";
import { openai } from "./openaiConfig";

const createVectorStore = async ({
  userName,
  userId,
}: {
  userName: string;
  userId: string;
}) => {
  const assistantId = process.env.OPENAI_ASSISTANT_ID!;
  // create a new vector store and attach it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: `${userName}-vector-store`,
    metadata: { userId },
  });
  await prisma.studio.update({
    where: {
      userId,
    },
    data: {
      vectorStoreId: vectorStore.id,
    },
  });

  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};

export { createVectorStore };
