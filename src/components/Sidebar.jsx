import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-60 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">📁 Dashboard</h2>
      <nav className="space-y-4">
        <Link to="/users" className="block hover:bg-gray-700 px-3 py-2 rounded">
          👤 Users
        </Link>
        <Link
          to="/vendors"
          className="block hover:bg-gray-700 px-3 py-2 rounded"
        >
          🏪 Vendors
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
