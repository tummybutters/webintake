import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const IntakeApp = lazy(() => import('./components/IntakeApp'));
const Template1 = lazy(() => import('./templates/Template1'));
const Template2 = lazy(() => import('./templates/Template2'));
const Template3 = lazy(() => import('./templates/Template3'));
const Template4 = lazy(() => import('./templates/Template4'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading-state" />}>
        <Routes>
          <Route path="/preview/1" element={<Template1 />} />
          <Route path="/preview/2" element={<Template2 />} />
          <Route path="/preview/3" element={<Template3 />} />
          <Route path="/preview/4" element={<Template4 />} />
          <Route path="/" element={<IntakeApp />} />
          <Route path="*" element={<IntakeApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
