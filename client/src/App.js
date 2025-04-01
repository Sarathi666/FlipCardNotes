import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Vault from './pages/Vault';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [workspaces, setWorkspaces] = useState([]);   // ✅ Centralized state

  return (
    <Router>
      <Routes>
        {/* Pass workspaces and setter as props */}
        <Route path="/" element={<Home workspaces={workspaces} setWorkspaces={setWorkspaces} />} />
        <Route path="/vault/:id" element={<Vault workspaces={workspaces} setWorkspaces={setWorkspaces} />} />
      </Routes>
    </Router>
  );
};

export default App;
