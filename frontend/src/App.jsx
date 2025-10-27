import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UrlForm from "./components/UrlForm";
import Analytics from "./components/Analytics";
import Features from "./components/Features";

const App = () => {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <div className="brand-mark">🔗</div>
              <div>
                <div className="brand-title">ScaleURL</div>
                <div className="brand-sub">URL Shortener</div>
              </div>
            </div>
            <nav className="top-actions">
              <Link to="/features" className="btn btn-ghost">Features</Link>
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
            <Route path="/features" element={<Features />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
