import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { getOrCreateVectorStore } from "~/lib/openai/getOrCreateVectorStore";
import { openai } from "~/lib/openai/openaiConfig";
import chatstyles from "~/css/chat.css";
import styles from "~/css/file-viewer.css";
import TrashIcon from "~/components/icons/TrashIcon";
import Chat from "~/components/Chat";

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
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  // add file to vector store
  const vectorstoreResponse = await openai.beta.vectorStores.files.create(
    vectorStoreId,
    {
      file_id: openaiFile.id,
    },
  );
  console.log("vectorstoreResponse", vectorstoreResponse);

  return { message: "action function run successfully" };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
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
  return { files: filesArray, threadId: thread.id };
};

export default function StudioAssistant() {
  const fetcher = useFetcher({ key: "fileLoader" });

  const { files, threadId } = useLoaderData<typeof loader>();
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
                  {/* <span onClick={() => handleFileDelete(file.file_id)}> */}
                  <span onClick={() => console.log("delete file")}>
                    <TrashIcon />
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="fileUploadContainer">
            <fetcher.Form encType="multipart/form-data">
              <label htmlFor="file-upload" className="fileUploadBtn">
                Attach files
              </label>
              <input
                type="file"
                id="file-upload"
                name="file-upload"
                className="fileUploadInput"
                multiple
                onChange={(event) => {
                  fetcher.submit(event.currentTarget.form, {
                    method: "POST",
                  });
                }}
              />
            </fetcher.Form>
          </div>
        </div>
      </div>
      <div className="page_chatContainer">
        <div className="chat">
          <Chat />
        </div>
      </div>
    </div>
  );
}
