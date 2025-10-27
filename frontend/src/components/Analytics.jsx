import React, { useState } from "react";
import api1 from "../api1";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const [shortCode, setShortCode] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!shortCode.trim()) return toast.error("Enter a short code");
    setLoading(true);
    try {
      const res = await api1.get(`/analytics/${shortCode}`);
      setAnalyticsData(res.data.analytics);
    } catch (err) {
      toast.error(err.response?.data?.error || "Not found");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getDailyVisitsData = () => {
    if (!analyticsData?.dailyVisits) return [];
    return Object.entries(analyticsData.dailyVisits).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visits: count
    }));
  };

  const getReferrerData = () => {
    if (!analyticsData?.referrers) return [];
    return Object.entries(analyticsData.referrers).map(([referrer, count]) => ({
      name: referrer || 'Direct',
      value: count
    }));
  };

  const getDeviceData = () => {
    if (!analyticsData?.devices) return [];
    return Object.entries(analyticsData.devices).map(([device, count]) => ({
      name: device,
      value: count
    }));
  };

  const getBrowserData = () => {
    if (!analyticsData?.browsers) return [];
    return Object.entries(analyticsData.browsers).map(([browser, count]) => ({
      name: browser,
      value: count
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="analytics-container">
      <div className="card analytics-card">
        <h3>📈 Advanced Analytics</h3>
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter short code (e.g., abc123)"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchAnalytics()}
          />
          <button onClick={fetchAnalytics} disabled={loading}>
            {loading ? 'Loading...' : 'Get Analytics'}
          </button>
        </div>

        {analyticsData && (
          <div className="analytics-results">
            {/* Overview Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👆</div>
                <div className="stat-value">{analyticsData.visitCount}</div>
                <div className="stat-label">Total Visits</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">
                  {new Date(analyticsData.createdAt).toLocaleDateString()}
                </div>
                <div className="stat-label">Created Date</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-value">
                  {analyticsData.originalUrl?.length > 40 
                    ? `${analyticsData.originalUrl.substring(0, 40)}...`
                    : analyticsData.originalUrl
                  }
                </div>
                <div className="stat-label">Original URL</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🆔</div>
                <div className="stat-value">{analyticsData.shortCode}</div>
                <div className="stat-label">Short Code</div>
              </div>
            </div>

            {/* Daily Visits Chart */}
            {getDailyVisitsData().length > 0 && (
              <div className="chart-section">
                <h4>Daily Visits Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getDailyVisitsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Referrers Pie Chart */}
              {getReferrerData().length > 0 && (
                <div className="chart-card">
                  <h4>Traffic Sources</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getReferrerData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getReferrerData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Devices Pie Chart */}
              {getDeviceData().length > 0 && (
                <div className="chart-card">
                  <h4>Devices</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getDeviceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getDeviceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Browser Data */}
            {getBrowserData().length > 0 && (
              <div className="chart-section">
                <h4>Browser Usage</h4>
                <div className="browser-list">
                  {getBrowserData().map((browser, index) => (
                    <div key={browser.name} className="browser-item">
                      <span className="browser-name">{browser.name}</span>
                      <div className="browser-bar">
                        <div 
                          className="browser-fill"
                          style={{ 
                            width: `${(browser.value / Math.max(...getBrowserData().map(b => b.value))) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                      <span className="browser-count">{browser.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;