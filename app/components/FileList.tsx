import React from "react";
import { File as FileIcon, Eye, Image, FileText } from "lucide-react";
import type { FileType } from "../types/file";

interface FileListProps {
  files: FileType[];
  selectedFiles: Set<string>;
  onFileSelection: (filename: string) => void;
  onPreview: (file: FileType) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelection,
  onPreview,
}) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image size={24} className="text-indigo-600" />;
      case "pdf":
        return <FileText size={24} className="text-red-600" />;
      case "txt":
        return <FileText size={24} className="text-green-600" />;
      default:
        return <FileIcon size={24} className="text-indigo-600" />;
    }
  };

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li
          key={file.name}
          className={`flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 ${
            selectedFiles.has(file.name) ? "ring-2 ring-indigo-500" : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedFiles.has(file.name)}
              onChange={() => onFileSelection(file.name)}
              className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
            />
            {getFileIcon(file.name)}
            <span className="font-medium text-gray-700">{file.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </span>
            <button
              onClick={() => onPreview(file)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <Eye size={20} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
