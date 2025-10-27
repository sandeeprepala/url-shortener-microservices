import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";


// let VITE_BACKEND_URL = "http://localhost:8000"

let VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const UrlForm = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return toast.error("Please enter a URL");

    try {
      const res = await api.post("/api/v1/url/shorten", { originalUrl, customCode });
      setShortUrl(res.data.shortUrl);
      toast.success("Short URL created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    }
  };

  const redirect = () => {
    window.location.href =`${VITE_BACKEND_URL}/api/v1/url/${shortUrl.split('/').pop()}`;  
    };

  return (
    <div className="url-form-container card">
      <div style={{marginBottom: '28px'}}>
        <h2 style={{
          margin: 0,
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.02em',
          marginBottom: '8px'
        }}>
          Shorten Your URL
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.95rem',
          color: '#64748b',
          fontWeight: 400
        }}>
          Create short, trackable links in seconds
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#0f172a'
          }}>
            Destination URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/your-long-url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#0f172a'
          }}>
            Custom Code (Optional)
          </label>
          <input
            type="text"
            placeholder="my-custom-code"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
          />
        </div>
        <button type="submit">Create Short Link</button>
      </form>

      {shortUrl && (
        <div className="result">
          <p>Your short link is ready!</p>
          <a href={`${VITE_BACKEND_URL}/api/v1/url/${shortUrl.split('/').pop()}`} target="_blank" rel="noreferrer">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
