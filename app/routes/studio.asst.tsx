import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { createVectorStore } from "~/lib/openai/createVectorStore";
import { openai } from "~/lib/openai/openaiConfig";
import chatstyles from "~/css/chat.css";
import styles from "~/css/file-viewer.css";
import TrashIcon from "~/components/icons/TrashIcon";
import Chat from "~/components/Chat";
import { requireStudioUserId } from "~/models/studio.server";
import { prisma } from "~/db.server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useState } from "react";
import axios from "axios";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: chatstyles },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      const uploadHandler = unstable_createMemoryUploadHandler({
        maxPartSize: 500_000,
      });
      const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler,
      );

      const file = formData.get("file");
      const vectorStoreId = formData.get("vectorStoreId") as string;

      if (!file) {
        throw new Error("No file was uploaded");
      }

      const openaiFile = await openai.files.create({
        file: file,
        purpose: "assistants",
      });

      const vectorstoreResponse = await openai.beta.vectorStores.files.create(
        vectorStoreId,
        {
          file_id: openaiFile.id,
        },
      );

      return { message: "file uploaded to vector store" };
    }

    case "DELETE": {
      const body = await request.formData();
      const fileId = body.get("fileId") as string;

      let deResponse = await openai.files.del(fileId);
      if (deResponse.deleted === true) {
        // delay response by 1 sec to allow time to propagate deletion through to VectorStore at OpenAi
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                error: null,
                message: "file deleted",
                data: deResponse,
              }),
            1000,
          ),
        );
      } else {
        return new Promise((_, reject) =>
          setTimeout(() => reject(new Error("error deleting file")), 1000),
        );
      }
    }
    default: {
      return { message: "file api action function ran" };
    }
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const studioId = await requireStudioUserId(request);

  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET!,
    },
    region: process.env.STORAGE_REGION,
  });

  const fileKey = studioId;
  const presignedUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: "dancernotes",
      Key: `compSchedules/${fileKey}`,
    }),
  );

  return { presignedUrl, studioId };
};

export default function StudioAssistant() {
  const fetcher = useFetcher();
  const [file, setFile] = useState<File | null>();

  const { presignedUrl, studioId } = useLoaderData<typeof loader>();
  console.log("presignedUrl", presignedUrl);

  const handleFileDelete = (fileId: string) => {
    const body = new FormData();
    body.append("fileId", fileId);
    fetcher.submit(body, {
      method: "DELETE",
    });
  };

  const handleS3Upload = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    // setSubmitting(true)
    // if(!file){
    //   return null
    // }
    if (file) {
      try {
        await axios.put(presignedUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
        // Handle successful upload response: save and redirect, -> resource route
        const formData = new FormData();
        formData.append("fileKey", studioId);
        fetcher.submit(formData, {
          method: "post",
        });
      } catch (error) {
        console.error("Upload failed", error);
        // setSubmitting(false)
        // TODO Handle upload error
      }
    }
  };
  return (
    <div className="page-container">
      <div className="column">
        <div className="fileViewer">
          <div className="filesList">
            <div className="title">Attach files to test file upload</div>
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
                onChange={async (event) => {
                  if (!event.target.files) return;
                  await axios.put(presignedUrl, event.target.files[0], {
                    headers: {
                      "Content-Type": event.target.files[0].type,
                    },
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
