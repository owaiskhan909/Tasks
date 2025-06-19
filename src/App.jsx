import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ModalPage from "./components/ModalPage";
import UserDetails from "./components/UserDetails";
import VendorDetails from "./components/VendorDetails";
import UserPage from "./pages/UserPage";
import VendorPage from "./pages/VendorPage";
import VendorModalPage from "./components/VendorModalPage";

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-gray-100 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/users" />} />

          {/* User Routes */}
          <Route path="/users" element={<UserPage />}>
            <Route index element={<ModalPage />} />
            <Route path=":id" element={<UserDetails />} />
          </Route>

          {/* Vendor Routes */}
          <Route path="/vendors" element={<VendorPage />}>
            <Route index element={<VendorModalPage />} />
            <Route path=":id" element={<VendorDetails />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
