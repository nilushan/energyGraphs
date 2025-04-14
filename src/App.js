import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import DailyPowerConsumption from './components/DailyPowerConsumption';
import RoomPowerBreakdown from './components/RoomPowerBreakdown';
import DevicePowerBreakdown from './components/DevicePowerBreakdown';
import WeeklyComparisonChart from './components/WeeklyComparisonChart';
import ImprovedControlPointAnalysis from './components/ImprovedControlpointAnalysis';
import TimeHeatmap from './components/Heatmap';
import MonthlyTrend from './components/MonthlyTrends';
import UsageAnomalyDetection from './components/UsageAnomallyDetection';
import DeviceTimeline from './components/Timeline';

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Home Energy Monitoring Dashboard</h1>
          <p className="text-gray-600">Analyze and optimize your home energy consumption with these interactive visualizations</p>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <NavLink
                to="/controlpointanalysis"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Control Point Analysis
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/daily"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Daily Usage
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/rooms"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Room Breakdown
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/devices"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Device Breakdown
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/weekly"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Weekly Comparison
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/heatmap"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Usage Heatmap
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/monthly"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Monthly Trends
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/anomaly"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Anomaly Detection
              </NavLink>
            </li>
            <li className="mr-2">
              <NavLink
                to="/timeline"
                className={({ isActive }) =>
                  isActive
                    ? "inline-block p-4 rounded-t-lg text-blue-600 border-b-2 border-blue-600"
                    : "inline-block p-4 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300"
                }
              >
                Network Timeline
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          <Routes>
            <Route path="/" element={<Navigate to="/daily" />} />
            <Route path="/daily" element={<DailyPowerConsumption />} />
            <Route path="/rooms" element={<RoomPowerBreakdown />} />
            <Route path="/devices" element={<DevicePowerBreakdown />} />
            <Route path="/weekly" element={<WeeklyComparisonChart />} />
            <Route path="/controlpointanalysis" element={<ImprovedControlPointAnalysis />} />
            <Route path="/heatmap" element={<TimeHeatmap />} />
            <Route path="/monthly" element={<MonthlyTrend />} />
            <Route path="/anomaly" element={<UsageAnomalyDetection />} />
            <Route path="/timeline" element={<DeviceTimeline />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Home Energy Management System</p>
            <p className="mt-1">Data refreshed every 15 minutes from your control points</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
