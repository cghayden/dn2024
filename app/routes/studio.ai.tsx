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
import axios from "axios";
import { prisma } from "~/db.server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useState } from "react";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { json } from "stream/consumers";

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
  const userId = await requireStudioUserId(request);
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET!,
    },
    region: process.env.STORAGE_REGION,
  });

  const presignedUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: "dancernotes",
      Key: `compSchedules/${userId}`,
      // ContentType: "image/jpeg",
    }),
  );

  if (!presignedUrl) {
    throw new Error("Error obtaining presigned url");
  } else {
    let files: [] = [];
    return { presignedUrl, files };
  }

  // const user = await prisma.studio.findUnique({
  //   where: {
  //     userId,
  //   },
  //   select: {
  //     vectorStoreId: true,
  //     name: true,
  //   },
  // });

  // if (!user) throw new Error("User not found");
  // let vectorStoreId = user.vectorStoreId;

  // if (!vectorStoreId) {
  //   vectorStoreId = await createVectorStore({
  //     userName: user.name,
  //     userId,
  //   });
  // }

  // each studio / user has a vector store unique to them. ...
  // get files that belong to this vector store, unique to studio/user

  // const filesArray = await Promise.all(
  //   fileList.data.map(async (file) => {
  //     const fileDetails = await openai.files.retrieve(file.id);
  //     return {
  //       file_id: file.id,
  //       filename: fileDetails.filename,
  //     };
  //   }),
  // );
  //todo - should create thread go in chat component when a new message is sent?
  // const thread = await openai.beta.threads.create();
  // return {
  //   files: filesArray,
  //   // threadId: thread.id,
  //   vectorStoreId,
  // };
};

export default function StudioAssistant() {
  const fetcher = useFetcher();

  const { presignedUrl, files } = useLoaderData<typeof loader>();
  console.log("presignedUrl", presignedUrl);

  const handleFileDelete = (fileId: string) => {
    const body = new FormData();
    body.append("fileId", fileId);
    fetcher.submit(body, {
      method: "DELETE",
    });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (e.target.files) {
      try {
        const file = e.target.files[0];
        console.log("file", file);
        const upload = await axios.put(presignedUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
        console.log("upload", upload);
        // TODO - set busy UI

        // Handle successful upload response: save fileKey to studio
        // const formData = new FormData()
        // formData.append('fileKey', fileKey)
        // submit(formData, {
        //   method: 'post',
        //   action: `/parent/dancer/${dancerId}/resourceSaveImage`,
        // })
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
                    {/* <span className="fileStatus">{file.status}</span> */}
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
                onChange={handleFileUpload}
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
