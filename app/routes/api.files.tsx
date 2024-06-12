import { ActionFunctionArgs } from "@remix-run/node";
import { get } from "http";
import { getOrCreateVectorStore } from "~/lib/openai/getOrCreateVectorStore";
import { openai } from "~/lib/openai/openaiConfig";

export const action = async ({ request }: ActionFunctionArgs) => {
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
      const body = await request.formData();
      const fileId = body.get("fileId") as string;
      const delResponse = await openai.files.del(fileId);
      console.log("delresponse", delResponse);
      if (delResponse.deleted === true) {
        return { message: "file deleted" };
      } else {
        throw new Error("error deleting file");
      }
    }
    default: {
      return { message: "file api action function ran" };
    }
  }
};
