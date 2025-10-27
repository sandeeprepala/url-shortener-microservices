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
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
        <div>
          <h2 style={{margin:0}}>Create a Short Link</h2>
          <p style={{margin:0, fontSize:12, color:'#6b7280'}}>Fast. Reliable. Trackable.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter your long URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Custom short code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
        />
        <button type="submit">Shorten URL</button>
      </form>

      {shortUrl && (
        <div className="result">
          <p>Your shortened URL:</p>
          <a href={`${VITE_BACKEND_URL}/api/v1/url/${shortUrl.split('/').pop()}`} target="_blank" rel="noreferrer">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
