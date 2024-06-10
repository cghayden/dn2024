import { useEffect, useState } from "react";
import styles from "../css/file-viewer.module.css";
import { LinksFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import TrashIcon from "./icons/TrashIcon";

// export const links : LinksFunction = () => [
//   { rel: "stylesheet", href: styles }
// ]

const FileViewer = () => {
  const [files, setFiles] = useState([]);
  const fetcher = useFetcher();
  console.log("fetcher", fetcher);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchFiles();
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // const fetchFiles = async () => {
  //   const resp = await fetch("/api/assistants/files", {
  //     method: "GET",
  //   });
  //   const data = await resp.json();
  //   setFiles(data);
  // };

  // const handleFileDelete = async (fileId) => {
  //   await fetch("/api/assistants/files", {
  //     method: "DELETE",
  //     body: JSON.stringify({ fileId }),
  //   });
  // };

  const handleFileUpload = async (event) => {
    const data = new FormData();
    if (event.target.files.length < 0) return;
    data.append("file", event.target.files[0]);
    fetcher.submit(data, { method: "POST" });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gray-300 p-5">
      <div
        className={`${styles.filesList} ${
          files.length !== 0 ? styles.grow : ""
        }`}
      >
        {files.length === 0 ? (
          <div className={styles.title}>Attach files to test file search</div>
        ) : (
          files.map((file) => (
            <div key={file.file_id} className={styles.fileEntry}>
              <div className={styles.fileName}>
                <span className={styles.fileName}>{file.filename}</span>
                <span className={styles.fileStatus}>{file.status}</span>
              </div>
              {/* <span onClick={() => handleFileDelete(file.file_id)}>
                <TrashIcon />
              </span> */}
            </div>
          ))
        )}
      </div>
      <div className={styles.fileUploadContainer}>
        <fetcher.Form method="post" encType="multipart/form-data">
          <label htmlFor="file-upload" className={styles.fileUploadBtn}>
            Attach files
          </label>
          <input
            type="file"
            id="file-upload"
            name="file-upload"
            className={styles.fileUploadInput}
            multiple
            onChange={handleFileUpload}
          />
        </fetcher.Form>
      </div>
    </div>
  );
};

export default FileViewer;
