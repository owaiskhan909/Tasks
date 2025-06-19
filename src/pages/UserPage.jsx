import React from "react";
import { Outlet } from "react-router-dom";

function UserPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 User Management</h1>
      <Outlet />
    </div>
  );
}

export default UserPage;
