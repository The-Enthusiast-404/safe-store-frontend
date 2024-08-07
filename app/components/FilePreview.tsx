import { X } from "lucide-react";

const FilePreviewModal = ({ file, onClose }) => {
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
          {isImage && (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="max-w-full max-h-[70vh] mx-auto"
            />
          )}
          {isPDF && (
            <iframe
              src={URL.createObjectURL(file)}
              title={file.name}
              className="w-full h-[70vh]"
            />
          )}
          {isText && (
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
              {file.content}
            </pre>
          )}
          {!isImage && !isPDF && !isText && (
            <p className="text-center text-gray-500">
              Preview not available for this file type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
