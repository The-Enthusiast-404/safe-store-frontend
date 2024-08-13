const API_URL = "http://localhost:8080"; // Replace with your Go backend URL

export async function getFiles() {
  const response = await fetch(`${API_URL}/files`);
  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }
  return response.json();
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return response.json();
}
