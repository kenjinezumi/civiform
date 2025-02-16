import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import AdminDashboard from '../pages/AdminDashboard';
import PublicForm from '../components/public/PublicForm';
import FormBuilder from '../components/admin/FormBuilder';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/forms/:formId" element={<PublicForm />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/forms/builder" element={<FormBuilder />} />
        {/* Add more as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
