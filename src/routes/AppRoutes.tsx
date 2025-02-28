// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public pages
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/Login';
import PublicForm from '../components/public/PublicForm';

// Admin / Protected
import AdminDashboard from '../pages/AdminDashboard';
import FormBuilder from '../components/admin/FormBuilder/FormBuilder';
import MyForms from '../pages/MyForms';
import CreateForm from '../pages/CreateForm';

// NEW: PartnerManager page for creating multiple URLs for each partner
import PartnerManager from '../pages/PartnerManager';

// Layout & Auth
import SiteLayout from '../components/layout/SiteLayout';
import RequireAuth from './RequireAuth';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (wrapped in SiteLayout so they get the header/footer) */}
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
        <Route
          path="/forms/:formId"
          element={
            <SiteLayout>
              <PublicForm />
            </SiteLayout>
          }
        />

        {/* Login route (no layout, or add if you wish) */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes (RequireAuth) */}
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

        {/* A route for building or editing a form, optionally with :formId */}
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

        {/* My Forms (list of forms) */}
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

        {/* Create a brand-new form */}
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

        {/* NEW: Partner Manager route for multiple partner URLs */}
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
