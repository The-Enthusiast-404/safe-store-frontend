import React, { useState } from "react";
import {
  useLoaderData,
  Form,
  useSubmit,
  useActionData,
  useNavigation,
  useTransition,
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
      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return redirect("/");
    } catch (error) {
      console.error("Error uploading file:", error);
      return json({ error: "Failed to upload file" }, { status: 500 });
    }
  } else if (intent === "delete") {
    const filename = formData.get("filename") as string;
    if (!filename) {
      return json({ error: "No filename provided" }, { status: 400 });
    }

    try {
      const response = await fetch(`${BASE_URL}/delete/${filename}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return redirect("/");
    } catch (error) {
      console.error("Error deleting file:", error);
      return json({ error: "Failed to delete file" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function Index() {
  const { files, error } = useLoaderData<{
    files: Array<{ name: string; size: number }>;
    error?: string;
  }>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    submit(formData, { method: "post" });
  };

  const handleDelete = (filename: string) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      const formData = new FormData();
      formData.append("filename", filename);
      formData.append("intent", "delete");
      submit(formData, { method: "post" });
    }
  };

  const isLoading =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">File Management</h1>

      {(actionData?.error || error) && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {actionData?.error || error}</span>
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
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upload"}
          </button>
        </div>
      </Form>

      <h2 className="text-2xl font-semibold mb-4">Files:</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : files && files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.name}
              className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
            >
              <span>
                {file.name} ({file.size} bytes)
              </span>
              <div className="space-x-2">
                <a
                  href={`${BASE_URL}/download/${file.name}`}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No files found.</p>
      )}
    </div>
  );
}
