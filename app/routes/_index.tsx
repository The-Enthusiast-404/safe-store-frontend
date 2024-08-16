import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Safe Store</h1>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/upload" className="text-blue-500 hover:text-blue-700">
              Upload a file
            </Link>
          </li>
          <li>
            <Link to="/files" className="text-blue-500 hover:text-blue-700">
              View and download files
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
