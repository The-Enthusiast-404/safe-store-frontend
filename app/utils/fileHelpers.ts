export const getFileType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "txt":
      return "text/plain";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return "image/*";
    default:
      return "application/octet-stream";
  }
};

export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024).toFixed(2) + " KB";
};
