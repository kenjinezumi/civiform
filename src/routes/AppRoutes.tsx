import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import PublicForm from "../components/public/PublicForm";
import FormPreview from "../components/public/FormPreview"; 
import FormAccessManager from "../pages/FormAccessManager"; 
import PartnerFormPage from "../pages/PartnerFormPage";  

// Admin / Protected
import AdminDashboard from "../pages/AdminDashboard";
import FormBuilder from "../components/admin/FormBuilder/FormBuilder";
import MyForms from "../pages/MyForms";
import CreateForm from "../pages/CreateForm";

// PartnerManager
import PartnerManager from "../pages/PartnerManager";

// Layout & Auth
import SiteLayout from "../components/layout/SiteLayout";
import RequireAuth from "./RequireAuth";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
        <Route path="/about" element={<SiteLayout><About /></SiteLayout>} />

        {/* Public Form Access */}
        <Route path="/forms/:formId" element={<SiteLayout><PublicForm /></SiteLayout>} />

        {/* Preview route */}
        <Route path="/forms/preview/:formId" element={<SiteLayout><FormPreview /></SiteLayout>} />

        {/* ✅ NEW: Partner Form (ONLY accessible by partners) */}
        <Route path="/partner-forms/:partner_id" element={<PartnerFormPage />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAuth><SiteLayout><AdminDashboard /></SiteLayout></RequireAuth>} />
        <Route path="/admin/forms/builder" element={<RequireAuth><SiteLayout><FormBuilder /></SiteLayout></RequireAuth>} />
        <Route path="/admin/forms/builder/:formId" element={<RequireAuth><SiteLayout><FormBuilder /></SiteLayout></RequireAuth>} />
        <Route path="/my-forms" element={<RequireAuth><SiteLayout><MyForms /></SiteLayout></RequireAuth>} />
        <Route path="/admin/forms/create" element={<RequireAuth><SiteLayout><CreateForm /></SiteLayout></RequireAuth>} />
        <Route path="/admin/forms/access/:formId" element={<RequireAuth><SiteLayout><FormAccessManager /></SiteLayout></RequireAuth>} />
        <Route path="/partner-manager" element={<RequireAuth><SiteLayout><PartnerManager /></SiteLayout></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
