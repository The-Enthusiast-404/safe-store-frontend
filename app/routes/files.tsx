import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import Header from "~/components/Header";
import { getFiles } from "utils/api";

export const loader: LoaderFunction = async () => {
  return getFiles();
};

export default function Files() {
  const files = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Files</h1>
        <ul className="space-y-2">
          {files.map((file: { id: string; name: string }) => (
            <li key={file.id} className="bg-white p-4 rounded shadow">
              {file.name}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
