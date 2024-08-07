import React, { useState } from "react";
import { Form, useSubmit, useNavigation } from "@remix-run/react";
import { Upload } from "lucide-react";

export const UploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const submit = useSubmit();
  const navigation = useNavigation();
  const isUploading =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "upload";

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

  return (
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
                {selectedFile ? selectedFile.name : "Select a file to upload"}
              </span>
            </span>
          </div>
        </label>
        <button
          type="submit"
          className="flex items-center justify-center h-12 px-6 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? (
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
  );
};
