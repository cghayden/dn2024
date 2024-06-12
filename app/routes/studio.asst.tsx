import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getOrCreateVectorStore } from "~/lib/openai/getOrCreateVectorStore";
import { openai } from "~/lib/openai/openaiConfig";
import chatstyles from "~/css/chat.css";
import styles from "~/css/file-viewer.css";
import TrashIcon from "~/components/icons/TrashIcon";
import Chat from "~/components/Chat";
import { requireStudioUserId } from "~/models/studio.server";
import { getOrCreateAssistant } from "~/lib/openai/getOrCreateAssistant";
import { prisma } from "~/db.server";
import { Assistant } from "openai/resources/beta/assistants";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: chatstyles },
];

export type UploadedFileObject = {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // const userId = await requireStudioUserId(request);
  // const user = await prisma.studio.findUnique({
  //   where: {
  //     userId,
  //   },
  //   select: {
  //     assistantId: true,
  //     name: true,
  //   },
  // });
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get("file");
  // const vectorStoreId = formData.get("vectorStoreId") as string;
  // console.log("vectorStoreId in action", vectorStoreId);

  if (!file) {
    throw new Error("No file was uploaded");
  }

  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  // const vectorStoreId = await getOrCreateVectorStore({
  //   assistant,
  //   userName: user?.name,
  // });
  // add file to vector store
  const vectorstoreResponse = await openai.beta.vectorStores.files.create(
    "vs_nJUITSeoHWX8iUvq5crPedLV",
    {
      file_id: openaiFile.id,
    },
  );
  console.log("vectorstoreResponse", vectorstoreResponse);

  return { message: "action function run successfully" };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireStudioUserId(request);
  const user = await prisma.studio.findUnique({
    where: {
      userId,
    },
    select: {
      assistantId: true,
      vectorStoreId: true,
      name: true,
    },
  });

  if (!user) throw new Error("User not found");
  // TODO if user.assistantId is null, create assistant
  const assistant = await getOrCreateAssistant({
    userId,
    assistantId: user?.assistantId,
  });

  // TODO if user.vectorStoreId = null,create vector store
  const vectorStoreId = await getOrCreateVectorStore({
    assistant: assistant,
    userName: user?.name,
  });

  const fileList = await openai.beta.vectorStores.files.list(vectorStoreId);

  //get files that belong to this studio
  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        file.id,
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    }),
  );
  const thread = await openai.beta.threads.create();
  return {
    files: filesArray,
    threadId: thread.id,
    assistant,
    assistantId: assistant.id,
  };
};

export default function StudioAssistant() {
  const fetcher = useFetcher();

  const { files, threadId, assistant, assistantId } =
    useLoaderData<typeof loader>();

  const handleFileDelete = async (fileId: string) => {
    const body = new FormData();
    body.append("fileId", fileId);
    fetcher.submit(body, {
      method: "DELETE",
      action: "/api/files",
    });
  };
  return (
    <div className="page-container">
      <div className="column">
        <div className="fileViewer">
          <div
            className={`filesList
            ${files.length !== 0 ? "grow" : ""}`}
          >
            {files.length === 0 ? (
              <div className="title">Attach files to test file search</div>
            ) : (
              files.map((file) => (
                <div key={file.file_id} className="fileEntry">
                  <div className="fileName">
                    <span className="fileName">{file.filename}</span>
                    <span className="fileStatus">{file.status}</span>
                  </div>
                  <span onClick={() => handleFileDelete(file.file_id)}>
                    <TrashIcon />
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="fileUploadContainer">
            <fetcher.Form method="post" encType="multipart/form-data">
              <label htmlFor="file-upload" className="fileUploadBtn">
                Attach files
              </label>
              <input
                id="file-upload"
                type="file"
                name="file"
                className="fileUploadInput"
                onChange={(event) => {
                  const body = new FormData();
                  if (!event.target.files) return;
                  body.append("file", event.target.files[0]);
                  fetcher.submit(body, {
                    method: "POST",
                    encType: "multipart/form-data",
                  });
                }}
              />
            </fetcher.Form>
          </div>
        </div>
      </div>
      <div className="page_chatContainer">
        <div className="chat">{/* <Chat /> */}</div>
      </div>
    </div>
  );
}
