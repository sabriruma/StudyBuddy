import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../Home/Home';
import { Matching } from '../Matching/Matching';
import { Root } from '../../Root';
import { NotFound } from '../NotFound/NotFound';
import Chat from '../Chat/Chat';

//Different tabs
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />}>
          <Route index element={<Home />} />
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
root.render(<App />); 