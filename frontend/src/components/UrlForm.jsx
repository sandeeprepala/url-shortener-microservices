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
  const [finalurl, setFinalurl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return toast.error("Please enter a URL");

    try {
      const res = await api.post("/shorten", { originalUrl, customCode });
      console.log(res);
      // Successful creation
      setShortUrl(res.data.shortUrl);
      // Use customCode if provided, else use generated code
      const code = customCode ? customCode : res.data.shortUrl.split('/').pop();
      setFinalurl(`${VITE_BACKEND_URL}/${code}`);
      toast.success("Short URL created successfully!");
    } catch (err) {
      // axios error objects put status under err.response.status
      const status = err?.response?.status;
      if (status === 409) {
        // Friendly toast (not an error) when custom code already exists
        toast.info("This custom code already exists. Try a different one or leave it empty to auto-generate.");
        return;
      }

      console.error("Error creating short URL:", err);
      toast.error("Failed to create short URL. Please try again.");
    }
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

      {finalurl && (
        <div className="result" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{flex: 1}}>
            <p>Your short link is ready!</p>
            <a href={finalurl} target="_blank" rel="noreferrer">
              {finalurl}
            </a>
          </div>
          <button
            type="button"
            style={{
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '8px'
            }}
            onClick={() => {
              navigator.clipboard.writeText(finalurl);
              toast.success('Short link copied!');
            }}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
