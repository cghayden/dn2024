import {
  ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getOrCreateVectorStore } from "~/lib/openai/getOrCreateVectorStore";
import { openai } from "~/lib/openai/openaiConfig";

export type UploadedFileObject = {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get("file");
  if (!file) {
    throw new Error("No file was uploaded");
  }

  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });
  console.log("openaiFile", openaiFile);
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  // add file to vector store
  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });

  return { message: "action function run successfully" };
};

export default function StudioAssistant() {
  return (
    <div>
      <h1>Upload A File To Open Ai</h1>
      <Form method="post" encType="multipart/form-data">
        <label htmlFor="avatar-input">Avatar</label>
        <input id="file-input" type="file" name="file" />
        <button>Upload</button>
      </Form>
    </div>
  );
}
