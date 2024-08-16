import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

type File = {
  name: string;
  size: number;
  lastModified: string;
};

export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch("http://localhost:8080/files");
    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }
    const files: File[] = await response.json();
    return json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return json({ error: "Failed to fetch files" }, { status: 500 });
  }
};

export default function Files() {
  const data = useLoaderData<typeof loader>();
  const [downloadStatus, setDownloadStatus] = useState<{
    [key: string]: string;
  }>({});

  if ("error" in data) {
    return <div className="text-red-500">{data.error}</div>;
  }

  const files = data as File[];

  const handleDownload = async (filename: string) => {
    setDownloadStatus((prev) => ({ ...prev, [filename]: "Downloading..." }));
    try {
      const response = await fetch(
        `http://localhost:8080/download/${filename}`
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadStatus((prev) => ({ ...prev, [filename]: "Downloaded" }));
    } catch (error) {
      console.error("Download error:", error);
      setDownloadStatus((prev) => ({ ...prev, [filename]: "Download failed" }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Files</h1>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between bg-gray-100 p-2 rounded"
            >
              <span>{file.name}</span>
              <div>
                <span className="mr-4 text-sm text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
                <button
                  onClick={() => handleDownload(file.name)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  {downloadStatus[file.name] || "Download"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
