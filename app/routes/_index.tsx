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
import { File, Trash2, Download, Upload } from "lucide-react";

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

      const result = await response.json();
      return json({
        success: true,
        message: result.message,
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
      setSelectedFiles(new Set()); // Clear selection after deletion
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-6">
            File Vault
          </h1>

          {(actionData?.error || loaderError) && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{actionData?.error || loaderError}</p>
            </div>
          )}

          {actionData?.success && (
            <div
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
              role="alert"
            >
              <p className="font-bold">Success</p>
              <p>{actionData.message}</p>
            </div>
          )}

          <Form
            method="post"
            encType="multipart/form-data"
            onSubmit={handleUpload}
            className="mb-8"
          >
            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-600 focus:outline-none">
                  <span className="flex items-center space-x-2">
                    <Upload size={24} className="text-indigo-600" />
                    <span className="font-medium text-gray-600">
                      {selectedFile
                        ? selectedFile.name
                        : "Select a file to upload"}
                    </span>
                  </span>
                </div>
              </label>
              <button
                type="submit"
                className="flex items-center justify-center h-12 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Upload size={20} className="mr-2" />
                    Upload
                  </span>
                )}
              </button>
            </div>
          </Form>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Your Files
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : files && files.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-4 mb-6">
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedFiles.size === 0}
                  >
                    <Download size={16} className="mr-2" />
                    Download Selected
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedFiles.size === 0}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Selected
                  </button>
                </div>
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li
                      key={file.name}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.name)}
                          onChange={() => handleFileSelection(file.name)}
                          className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <File size={24} className="text-indigo-600" />
                        <span className="font-medium text-gray-700">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No files found. Upload some files to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
