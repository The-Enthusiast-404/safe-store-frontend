import React, { useState } from "react";
import {
  useLoaderData,
  Form,
  useSubmit,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";

const BASE_URL = "http://localhost:4000/v1";

export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch(`${BASE_URL}/files`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return json({ files: data.files || [] });
  } catch (error) {
    console.error("Error fetching files:", error);
    return json({ files: [], error: "Failed to fetch files" });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "upload") {
    const file = formData.get("file") as File;
    if (!file) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
      const newFormData = new FormData();
      newFormData.append("file", file);

      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: newFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      return redirect("/");
    } catch (error) {
      console.error("Error uploading file:", error);
      return json(
        { error: error.message || "Failed to upload file" },
        { status: 500 }
      );
    }
  } else if (intent === "delete") {
    const filenames = formData.getAll("filename") as string[];
    if (filenames.length === 0) {
      return json({ error: "No files selected for deletion" }, { status: 400 });
    }

    try {
      const response = await fetch(`${BASE_URL}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filenames }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete files");
      }

      return json({
        success: true,
        message: `Successfully deleted ${filenames.length} file(s)`,
      });
    } catch (error) {
      console.error("Error deleting files:", error);
      return json(
        { error: error.message || "Failed to delete files" },
        { status: 500 }
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function Index() {
  const { files, error: loaderError } = useLoaderData<{
    files: Array<{ name: string; size: number }>;
    error?: string;
  }>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const submit = useSubmit();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("intent", "upload");

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  const handleFileSelection = (filename: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (selectedFiles.size === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedFiles.size} file(s)?`
      )
    ) {
      const formData = new FormData();
      selectedFiles.forEach((filename) =>
        formData.append("filename", filename)
      );
      formData.append("intent", "delete");
      submit(formData, { method: "post" });
    }
  };

  const handleDownload = () => {
    selectedFiles.forEach((filename) => {
      window.open(`${BASE_URL}/download/${filename}`, "_blank");
    });
  };

  const isLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">File Management</h1>

      {(actionData?.error || loaderError) && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline">
            {" "}
            {actionData?.error || loaderError}
          </span>
        </div>
      )}

      {actionData?.success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {actionData.message}</span>
        </div>
      )}

      <Form
        method="post"
        encType="multipart/form-data"
        onSubmit={handleUpload}
        className="mb-8"
      >
        <div className="flex items-center space-x-4">
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </Form>

      <h2 className="text-2xl font-semibold mb-4">Files:</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : files && files.length > 0 ? (
        <>
          <div className="mb-4 space-x-2">
            <button
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={selectedFiles.size === 0}
            >
              Download Selected
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={selectedFiles.size === 0}
            >
              Delete Selected
            </button>
          </div>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.name}
                className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.name)}
                    onChange={() => handleFileSelection(file.name)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>
                    {file.name} ({file.size} bytes)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-600">No files found.</p>
      )}
    </div>
  );
}
