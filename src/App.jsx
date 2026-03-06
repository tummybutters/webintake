import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const IntakeApp = lazy(() => import('./components/IntakeApp'));
const TemplateGallery = lazy(() => import('./components/TemplateGallery'));
const TemplatePage = lazy(() => import('./components/TemplatePage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading-state" />}>
        <Routes>
          <Route path="/" element={<IntakeApp />} />
          <Route path="/templates" element={<TemplateGallery />} />
          <Route path="/templates/:slug" element={<TemplatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
