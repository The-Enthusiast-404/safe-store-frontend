import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-blue-500 hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>
            <Link to="/files" className="text-blue-500 hover:text-blue-600">
              Files
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
