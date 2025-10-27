import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UrlForm from "./components/UrlForm";
import Analytics from "./components/Analytics";

const App = () => {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <div className="brand-mark">🔗</div>
              <div>
                <div className="brand-title">LinkMetrics</div>
                <div className="brand-sub">URL Shortener & Analytics Platform</div>
              </div>
            </div>
            <nav className="top-actions">
              <a href="#features" className="btn btn-ghost">Features</a>
            </nav>
          </div>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<>
              <div className="left-panel">
                <UrlForm />
              </div>
              <div className="right-panel">
                <Analytics />
              </div>
            </>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
