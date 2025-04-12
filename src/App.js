import React, { useState } from 'react';
import DailyPowerConsumption from './components/DailyPowerConsumption';
import RoomPowerBreakdown from './components/RoomPowerBreakdown';
import DevicePowerBreakdown from './components/DevicePowerBreakdown';
import WeeklyComparisonChart from './components/WeeklyComparisonChart';
import ImprovedControlPointAnalysis from './components/ImprovedControlpointAnalysis';
import TimeHeatmap from './components/Heatmap';
import MonthlyTrend from './components/MonthlyTrends';
import UsageAnomalyDetection from './components/UsageAnomallyDetection';
// import TimeHeatmap from './components/TimeHeatmap';
// import MonthlyTrend from './components/MonthlyTrend';
// import StandbyPowerAnalysis from './components/StandbyPowerAnalysis';
// import UsageAnomalyDetection from './components/UsageAnomalyDetection';

function App() {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Home Energy Monitoring Dashboard</h1>
        <p className="text-gray-600">Analyze and optimize your home energy consumption with these interactive visualizations</p>
      </header>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
        <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'controlpointanalysis' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('controlpointanalysis')}
            >
              Control Point Analysis
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'daily' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('daily')}
            >
              Daily Usage
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'rooms' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('rooms')}
            >
              Room Breakdown
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'devices' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('devices')}
            >
              Device Breakdown
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'weekly' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('weekly')}
            >
              Weekly Comparison
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'heatmap' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('heatmap')}
            >
              Usage Heatmap
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly Trends
            </button>
          </li>
          {/* <li className="mr-2">
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'standby' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('standby')}
            >
              Standby Power
            </button>
          </li> */}
          <li>
            <button 
              className={`inline-block p-4 rounded-t-lg ${activeTab === 'anomaly' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('anomaly')}
            >
              Anomaly Detection
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="mb-6">
        {activeTab === 'daily' && <DailyPowerConsumption />}
        {activeTab === 'rooms' && <RoomPowerBreakdown />}
        {activeTab === 'devices' && <DevicePowerBreakdown />}
        {activeTab === 'weekly' && <WeeklyComparisonChart />}
        { activeTab === 'controlpointanalysis' && <ImprovedControlPointAnalysis />}
        {activeTab === 'heatmap' && < TimeHeatmap />}
        {activeTab === 'monthly' && <MonthlyTrend />}
        {/* {activeTab === 'standby' && <StandbyPowerAnalysis />} */}
        {activeTab === 'anomaly' && <UsageAnomalyDetection />} 
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 Home Energy Management System</p>
          <p className="mt-1">Data refreshed every 15 minutes from your control points</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
