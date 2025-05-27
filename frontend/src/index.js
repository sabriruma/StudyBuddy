import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home/Home';
import { Matching } from './pages/Matching/Matching';
import { NotFound } from './pages/NotFound/NotFound';
import Chat from './pages/Chat/Chat';

import { ThemeProvider } from './ThemeContext';

import { AppLayout } from './layouts/AppLayout';
import { LandingLayout } from './layouts/LandingLayout';

//Different tabs
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Home />} />
          </Route>
        <Route path="/" element={<AppLayout />}>
          <Route path="matching" element={<Matching />} />
          <Route path="chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);