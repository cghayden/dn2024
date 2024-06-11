import { ActionFunctionArgs } from "@remix-run/node";
import { get } from "http";
import { getOrCreateVectorStore } from "~/lib/openai/getOrCreateVectorStore";
import { openai } from "~/lib/openai/openaiConfig";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("file api action function");
  switch (request.method) {
    case "POST": {
      /* handle "POST" */
    }
    case "PUT": {
      /* handle "PUT" */
    }
    case "PATCH": {
      /* handle "PATCH" */
    }
    case "DELETE": {
      const body = await request.json();
      const fileId = body.fileId;
      const assistant = body.assistant;
      const vectorStoreId = await getOrCreateVectorStore({ assistant });
      console.log("vectorStoreId", vectorStoreId);
      const response = await openai.beta.vectorStores.files.del(
        vectorStoreId,
        fileId,
      );
      return response;
    }
    default: {
      return { message: "file api action function ran" };
    }
  }
};
