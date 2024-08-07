import React from "react";
import { File as FileIcon, Image, FileText } from "lucide-react";

interface FileProps {
  name: string;
  size: number;
  onPreview: () => void;
}

const FileCard: React.FC<FileProps> = ({ name, size, onPreview }) => {
  const getFileIcon = () => {
    const extension = name.split(".").pop()?.toLowerCase();
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
    <button
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 flex flex-col items-center cursor-pointer w-full text-left"
      onClick={onPreview}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPreview();
        }
      }}
      aria-label={`Preview ${name}, size: ${(size / 1024).toFixed(2)} KB`}
    >
      {getFileIcon()}
      <p className="mt-2 text-sm font-medium text-gray-900 text-center truncate w-full">
        {name}
      </p>
      <p className="text-xs text-gray-500">{(size / 1024).toFixed(2)} KB</p>
    </button>
  );
};

interface GridViewProps {
  files: Array<{ name: string; size: number }>;
  onPreview: (file: { name: string; size: number }) => void;
}

const GridView: React.FC<GridViewProps> = ({ files, onPreview }) => {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      role="grid"
      aria-label="File grid"
    >
      {files.map((file) => (
        <div key={file.name} role="gridcell">
          <FileCard
            name={file.name}
            size={file.size}
            onPreview={() => onPreview(file)}
          />
        </div>
      ))}
    </div>
  );
};

export default GridView;
