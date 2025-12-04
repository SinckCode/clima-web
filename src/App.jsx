// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import DailyAnalysisPage from "./pages/DailyAnalysisPage";
import CompliancePage from "./pages/CompliancePage";
import ResearchPage from "./pages/ResearchPage";
import ResearchExtendedPage from "./pages/ResearchExtendedPage";
import DailyHistoryPage from "./pages/DailyHistoryPage";

import "./styles/base/_reset.scss";
import "./styles/App.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/daily" element={<DailyAnalysisPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/research-extended" element={<ResearchExtendedPage />} />
          <Route path="/daily-history" element={<DailyHistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
