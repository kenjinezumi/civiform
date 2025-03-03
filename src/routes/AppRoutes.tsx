// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public pages
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/Login';
import PublicForm from '../components/public/PublicForm';
import FormPreview from '../components/public/FormPreview'; // <--- new preview wizard

// Admin / Protected
import AdminDashboard from '../pages/AdminDashboard';
import FormBuilder from '../components/admin/FormBuilder/FormBuilder';
import MyForms from '../pages/MyForms';
import CreateForm from '../pages/CreateForm';

// PartnerManager
import PartnerManager from '../pages/PartnerManager';

// Layout & Auth
import SiteLayout from '../components/layout/SiteLayout';
import RequireAuth from './RequireAuth';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route
          path="/"
          element={
            <SiteLayout>
              <Home />
            </SiteLayout>
          }
        />
        <Route
          path="/about"
          element={
            <SiteLayout>
              <About />
            </SiteLayout>
          }
        />

        {/* Example "public" form route */}
        <Route
          path="/forms/:formId"
          element={
            <SiteLayout>
              <PublicForm />
            </SiteLayout>
          }
        />

        {/* NEW Preview route for wizard */}
        <Route
          path="/forms/preview/:formId"
          element={
            <SiteLayout>
              <FormPreview />
            </SiteLayout>
          }
        />

        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <SiteLayout>
                <AdminDashboard />
              </SiteLayout>
            </RequireAuth>
          }
        />

        {/* Form Builder (admin) */}
        <Route
          path="/admin/forms/builder"
          element={
            <RequireAuth>
              <SiteLayout>
                <FormBuilder />
              </SiteLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/forms/builder/:formId"
          element={
            <RequireAuth>
              <SiteLayout>
                <FormBuilder />
              </SiteLayout>
            </RequireAuth>
          }
        />

        {/* MyForms, CreateForm, etc. */}
        <Route
          path="/my-forms"
          element={
            <RequireAuth>
              <SiteLayout>
                <MyForms />
              </SiteLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/forms/create"
          element={
            <RequireAuth>
              <SiteLayout>
                <CreateForm />
              </SiteLayout>
            </RequireAuth>
          }
        />

        {/* Partner manager */}
        <Route
          path="/partner-manager"
          element={
            <RequireAuth>
              <SiteLayout>
                <PartnerManager />
              </SiteLayout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
