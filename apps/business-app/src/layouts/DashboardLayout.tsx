import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar userRole={"owner"} />

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 relative overflow-y-auto w-full h-full bg-gray-50 dark:bg-gray-900"
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
