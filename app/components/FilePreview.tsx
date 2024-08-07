import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface FilePreviewModalProps {
  file: { name: string; url: string; type: string };
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setContent(objectUrl);
      } catch (err) {
        setError("Failed to load file preview");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();

    return () => {
      if (content) {
        URL.revokeObjectURL(content);
      }
    };
  }, [file.url]);

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const isText = file.type === "text/plain";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{file.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="preview-content">
          {loading && <p>Loading preview...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <>
              {isImage && (
                <img
                  src={content!}
                  alt={file.name}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              )}
              {isPDF && (
                <iframe
                  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
                    content!
                  )}`}
                  title={file.name}
                  className="w-full h-[70vh]"
                />
              )}
              {isText && (
                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
                  {content}
                </pre>
              )}
              {!isImage && !isPDF && !isText && (
                <p className="text-center text-gray-500">
                  Preview not available for this file type.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
