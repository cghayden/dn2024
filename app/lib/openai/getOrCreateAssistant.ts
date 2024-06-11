import { prisma } from "~/db.server";
import { openai } from "./openaiConfig";

export async function getOrCreateAssistant({
  userId,
  assistantId,
}: {
  userId: string;
  assistantId?: string | null | undefined;
}) {
  if (assistantId) {
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      return assistant;
    } catch (error) {
      throw new Error("Error retrieving assistant");
    }
  } else {
    try {
      // console.log("creating a new assistant");

      const assistant = await openai.beta.assistants.create({
        instructions:
          "You are a personal assistant to the owner of a dance studio.  The studio has dance classes and competitive dance teams.  You will assist the owner by answering questions about the studio and dance schedules that the owner will submit.  You will also be asked to update dance class data based on owner input and information found in files that the owner will provide.",
        name: "Dance Studio Assistant",
        tools: [{ type: "file_search" }],
        model: "gpt-4o",
        metadata: { userId: userId },
      });
      await prisma.studio.update({
        where: {
          userId,
        },
        data: {
          assistantId: assistant.id,
        },
      });

      return assistant;
    } catch (error) {
      throw new Error("Error creating assistant");
    }
  }
}
