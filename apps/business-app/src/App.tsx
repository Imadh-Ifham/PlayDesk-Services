import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { ScrollToTop } from "./utils/scrollToTop.util";
import DashboardLayout from "./layouts/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" />
      {/* Other components and routes can be added here */}
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" />} />
          <Route path="overview" element={<OverviewPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
