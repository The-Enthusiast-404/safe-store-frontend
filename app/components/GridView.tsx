import React from "react";
import { File as FileIcon, Image, FileText } from "lucide-react";
import type { FileType } from "../types/file";

interface FileProps {
  file: FileType;
  onPreview: (file: FileType) => void;
  isSelected: boolean;
  onFileSelection: (filename: string) => void;
}

const FileCard: React.FC<FileProps> = ({
  file,
  onPreview,
  isSelected,
  onFileSelection,
}) => {
  const getFileIcon = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <Image size={40} className="text-indigo-600" aria-hidden="true" />
        );
      case "pdf":
        return (
          <FileText size={40} className="text-red-600" aria-hidden="true" />
        );
      case "txt":
        return (
          <FileText size={40} className="text-green-600" aria-hidden="true" />
        );
      default:
        return (
          <FileIcon size={40} className="text-gray-600" aria-hidden="true" />
        );
    }
  };

  return (
    <div className="relative">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onFileSelection(file.name)}
        className="absolute top-2 left-2 form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out z-10"
      />
      <button
        className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 flex flex-col items-center cursor-pointer w-full text-left ${
          isSelected ? "ring-2 ring-indigo-500" : ""
        }`}
        onClick={() => onPreview(file)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPreview(file);
          }
        }}
        aria-label={`Preview ${file.name}, size: ${(file.size / 1024).toFixed(
          2
        )} KB`}
      >
        {getFileIcon()}
        <p className="mt-2 text-sm font-medium text-gray-900 text-center truncate w-full">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(file.size / 1024).toFixed(2)} KB
        </p>
      </button>
    </div>
  );
};

interface GridViewProps {
  files: FileType[];
  onPreview: (file: FileType) => void;
  selectedFiles: Set<string>;
  onFileSelection: (filename: string) => void;
}

const GridView: React.FC<GridViewProps> = ({
  files,
  onPreview,
  selectedFiles,
  onFileSelection,
}) => {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      role="grid"
      aria-label="File grid"
    >
      {files.map((file) => (
        <div key={file.name} role="gridcell">
          <FileCard
            file={file}
            onPreview={onPreview}
            isSelected={selectedFiles.has(file.name)}
            onFileSelection={onFileSelection}
          />
        </div>
      ))}
    </div>
  );
};

export default GridView;
