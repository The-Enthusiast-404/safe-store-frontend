import { useState } from "react";
import {
  useLoaderData,
  useSubmit,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { FileList } from "app/components/FileList";
import { UploadForm } from "app/components/UploadForm";
import GridView from "app/components/GridView";
import { FilePreviewModal } from "app/components/FilePreview";
import { ActionMessages } from "app/components/ActionMessages";
import { getFileType } from "app/utils/fileHelpers";
import type { FileType } from "app/types/file";
import { Grid, List, Download, Trash2 } from "lucide-react";

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
    files: FileType[];
    error?: string;
  }>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const submit = useSubmit();

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

  const handlePreview = (file: FileType) => {
    setPreviewFile(file);
  };

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
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

          <ActionMessages
            error={actionData?.error || loaderError}
            success={actionData?.success}
          />

          <UploadForm />

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Your Files
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label="Switch to list view"
                >
                  <List size={20} />
                </button>
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label="Switch to grid view"
                >
                  <Grid size={20} />
                </button>
              </div>
            </div>

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

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : files && files.length > 0 ? (
              viewMode === "list" ? (
                <FileList
                  files={files}
                  selectedFiles={selectedFiles}
                  onFileSelection={handleFileSelection}
                  onPreview={handlePreview}
                />
              ) : (
                <GridView
                  files={files}
                  onPreview={handlePreview}
                  selectedFiles={selectedFiles}
                  onFileSelection={handleFileSelection}
                />
              )
            ) : (
              <p className="text-gray-600 text-center py-8">
                No files found. Upload some files to get started!
              </p>
            )}
          </div>
        </div>
      </div>

      {previewFile && (
        <FilePreviewModal
          file={{
            name: previewFile.name,
            url: `${BASE_URL}/download/${previewFile.name}`,
            type: getFileType(previewFile.name),
          }}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
