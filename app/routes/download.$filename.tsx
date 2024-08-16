import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ params }) => {
  const filename = params.filename;

  if (!filename) {
    throw new Response("Filename is required", { status: 400 });
  }

  try {
    const response = await fetch(`http://localhost:8080/download/${filename}`);

    if (!response.ok) {
      throw new Response("File not found", { status: 404 });
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return { url, filename };
  } catch (error) {
    console.error("Download error:", error);
    throw new Response("Download failed", { status: 500 });
  }
};

export default function Download() {
  const data = useLoaderData<{ url: string; filename: string }>();

  if (!data || !data.url) {
    return <div>No file data available</div>;
  }

  // Trigger the download
  const link = document.createElement("a");
  link.href = data.url;
  link.download = data.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(data.url), 1000);

  return (
    <div>
      <p>Your download should begin automatically.</p>
      <p>
        If it doesn't,{" "}
        <a href={data.url} download={data.filename}>
          click here
        </a>{" "}
        to download the file.
      </p>
    </div>
  );
}
