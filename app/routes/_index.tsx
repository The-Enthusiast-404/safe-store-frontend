import { Link } from "@remix-run/react";
import Header from "~/components/Header";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Your Cloud Storage
        </h1>
        <p className="text-xl mb-6">
          Secure, private, and open-source cloud storage solution.
        </p>
        <Link
          to="/files"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          View Files
        </Link>
      </main>
    </div>
  );
}
