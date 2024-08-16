import { useState } from "react";
import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 });
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  try {
    const response = await fetch("http://localhost:8080/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return json({ success: true, message: "File uploaded successfully" });
  } catch (error) {
    return json({ error: "Upload failed" }, { status: 500 });
  }
};

export default function Upload() {
  const actionData = useActionData<typeof action>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload File</h1>
      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedFile}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Upload
        </button>
      </Form>
      {actionData?.error && (
        <p className="text-red-500 mt-2">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 mt-2">{actionData.message}</p>
      )}
    </div>
  );
}
