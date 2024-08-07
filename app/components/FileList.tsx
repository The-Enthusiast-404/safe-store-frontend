import React from "react";
import {
  File as FileIcon,
  Trash2,
  Download,
  Eye,
  Image,
  FileText,
} from "lucide-react";
import type { FileType } from "../types/file";

interface FileListProps {
  files: FileType[];
  selectedFiles: Set<string>;
  onFileSelection: (filename: string) => void;
  onDownload: () => void;
  onDelete: () => void;
  onPreview: (file: FileType) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelection,
  onDownload,
  onDelete,
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
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={onDownload}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedFiles.size === 0}
        >
          <Download size={16} className="mr-2" />
          Download Selected
        </button>
        <button
          onClick={onDelete}
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
    </div>
  );
};
