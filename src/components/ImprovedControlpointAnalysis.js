import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ImprovedControlPointAnalysis = () => {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For demo purposes, we'll create sample data
    
    // Generate sample control points
    const sampleControlPoints = [
      { id: 'cp1', name: 'Kitchen - Main', deviceName: 'Smart Switch', roomName: 'Kitchen' },
      { id: 'cp2', name: 'Living Room - TV Area', deviceName: 'Smart Outlet', roomName: 'Living Room' },
      { id: 'cp3', name: 'Master Bedroom - AC', deviceName: 'Smart Thermostat', roomName: 'Master Bedroom' },
      { id: 'cp4', name: 'Office - Computer Desk', deviceName: 'Smart Power Strip', roomName: 'Home Office' },
      { id: 'cp5', name: 'Kitchen - Refrigerator', deviceName: 'Energy Monitor', roomName: 'Kitchen' },
      { id: 'cp6', name: 'Laundry - Washer', deviceName: 'Smart Plug', roomName: 'Laundry Room' },
      { id: 'cp7', name: 'Bathroom - Water Heater', deviceName: 'Energy Monitor', roomName: 'Bathroom' },
    ];
    
    setControlPoints(sampleControlPoints);
    // By default, select the first 3 control points
    setSelectedControlPoints(sampleControlPoints.slice(0, 3).map(cp => cp.id));
    
    // Set date range based on selected time period
    const endDate = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    // Generate sample data points
    generateData(startDate, endDate, sampleControlPoints.slice(0, 3));
    
  }, [timeRange]);
  
  // When selected control points change, regenerate data
  useEffect(() => {
    if (controlPoints.length > 0 && dateRange.start && dateRange.end) {
      const selectedCPs = controlPoints.filter(cp => selectedControlPoints.includes(cp.id));
      generateData(new Date(dateRange.start), new Date(dateRange.end), selectedCPs);
    }
  }, [selectedControlPoints, dateRange]);
  
  const generateData = (startDate, endDate, selectedCPs) => {
    setIsLoading(true);
    
    // Calculate number of data points based on date range
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    let dataPoints = [];
    let interval = '';
    
    // Determine appropriate interval based on range
    if (daysDiff <= 2) {
      // For 1-2 days, show hourly data
      dataPoints = Array.from({ length: daysDiff * 24 }, (_, i) => {
        const date = new Date(startDate);
        date.setHours(date.getHours() + i);
        return date;
      });
      interval = 'hourly';
    } else if (daysDiff <= 31) {
      // For up to a month, show 3-hour intervals
      dataPoints = Array.from({ length: Math.ceil(daysDiff * 8) }, (_, i) => {
        const date = new Date(startDate);
        date.setHours(date.getHours() + (i * 3));
        return date;
      });
      interval = '3-hour';
    } else {
      // For longer periods, show daily data
      dataPoints = Array.from({ length: daysDiff }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return date;
      });
      interval = 'daily';
    }
    
    // Generate data with selected control points
    const sampleData = dataPoints.map(date => {
      const dataPoint = {
        timestamp: date.toISOString(),
        displayTime: interval === 'hourly' 
          ? `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:00` 
          : interval === '3-hour'
            ? `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:00`
            : `${date.getMonth()+1}/${date.getDate()}`
      };
      
      // Add data for each selected control point
      selectedCPs.forEach(cp => {
        // Generate realistic usage patterns
        let baseUsage = 0;
        const hour = date.getHours();
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Weekend vs weekday patterns
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (cp.roomName === 'Kitchen') {
          // Kitchen usage peaks during meal times
          if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            baseUsage = 250 + Math.random() * 150;
          } else if (hour >= 12 && hour <= 14) {
            baseUsage = 200 + Math.random() * 100;
          } else {
            baseUsage = 50 + Math.random() * 50;
          }
        } else if (cp.roomName === 'Living Room') {
          // Living room usage peaks in evening
          if (hour >= 18 && hour <= 23) {
            baseUsage = 180 + Math.random() * 120;
          } else if (isWeekend && hour >= 10 && hour <= 18) {
            baseUsage = 120 + Math.random() * 80;
          } else {
            baseUsage = 30 + Math.random() * 30;
          }
        } else if (cp.roomName === 'Master Bedroom' || cp.roomName.includes('Bedroom')) {
          // Bedroom usage in morning and night
          if ((hour >= 6 && hour <= 8) || (hour >= 21 && hour <= 23)) {
            baseUsage = 150 + Math.random() * 100;
          } else {
            baseUsage = 20 + Math.random() * 20;
          }
        } else if (cp.roomName === 'Home Office') {
          // Office usage during work hours on weekdays
          if (!isWeekend && hour >= 9 && hour <= 17) {
            baseUsage = 200 + Math.random() * 100;
          } else {
            baseUsage = 10 + Math.random() * 20;
          }
        } else if (cp.roomName === 'Bathroom') {
          // Bathroom usage in morning and evening
          if ((hour >= 6 && hour <= 8) || (hour >= 19 && hour <= 22)) {
            baseUsage = 300 + Math.random() * 200;
          } else {
            baseUsage = 5 + Math.random() * 10;
          }
        } else if (cp.roomName === 'Laundry Room') {
          // Laundry mostly on weekends or evenings
          if (isWeekend || (hour >= 18 && hour <= 21)) {
            baseUsage = 220 + Math.random() * 300 * (Math.random() > 0.7 ? 1 : 0); // Occasional spikes
          } else {
            baseUsage = 5 + Math.random() * 5;
          }
        } else {
          // Default pattern for other rooms
          if (hour >= 8 && hour <= 22) {
            baseUsage = 50 + Math.random() * 50;
          } else {
            baseUsage = 10 + Math.random() * 10;
          }
        }
        
        dataPoint[cp.id] = Math.round(baseUsage);
      });
      
      return dataPoint;
    });
    
    setData(sampleData);
    setIsLoading(false);
  };
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  const handleControlPointToggle = (cpId) => {
    setSelectedControlPoints(prev => 
      prev.includes(cpId)
        ? prev.filter(id => id !== cpId)
        : [...prev, cpId]
    );
  };
  
  const formatXAxis = (tickItem) => {
    // Shorten the display to prevent crowding
    const parts = tickItem.split(' ');
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Power Usage Analysis</h2>
      
      {/* Time range controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Time Range:</label>
          <select 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            className="border rounded p-1 text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Custom Range:</label>
          <input 
            type="date" 
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
            className="border rounded p-1 text-sm"
          />
          <span>to</span>
          <input 
            type="date" 
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
            className="border rounded p-1 text-sm"
          />
        </div>
      </div>
      
      {/* Control points selection */}
      <div className="mb-4">
        <h3 className="font-medium text-sm mb-2">Control Points Selected: {selectedControlPoints.length} of {controlPoints.length}</h3>
        <div className="flex flex-wrap gap-2">
          {controlPoints.map((cp) => (
            <button
              key={cp.id}
              onClick={() => handleControlPointToggle(cp.id)}
              className={`px-2 py-1 text-xs rounded-full ${
                selectedControlPoints.includes(cp.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              title={`${cp.deviceName} in ${cp.roomName}`}
            >
              {cp.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Data visualization */}
      <div className="h-64 mt-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>Loading data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayTime" 
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
              />
              <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => {
                  const cp = controlPoints.find(cp => cp.id === name);
                  return [`${value} W`, cp ? cp.name : name];
                }}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend 
                formatter={(value) => {
                  const cp = controlPoints.find(cp => cp.id === value);
                  return cp ? cp.name : value;
                }}
              />
              {selectedControlPoints.map((cpId, index) => {
                // Generate different colors for each line
                const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed'];
                return (
                  <Line
                    key={cpId}
                    type="monotone"
                    dataKey={cpId}
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Data collection information */}
      <div className="mt-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">Time Period:</span> {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Data Collection:</span> 15-minute intervals
          </div>
          <div>
            <span className="font-medium">Report Frequency:</span> Hourly
          </div>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedControlPoints.map(cpId => {
          const cp = controlPoints.find(cp => cp.id === cpId);
          if (!cp) return null;
          
          // Calculate statistics
          const cpData = data.map(d => d[cpId]).filter(v => v !== undefined);
          const avg = Math.round(cpData.reduce((sum, val) => sum + val, 0) / cpData.length);
          const max = Math.max(...cpData);
          const min = Math.min(...cpData);
          
          return (
            <div key={cpId} className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium">{cp.name}</h4>
              <p className="text-sm text-gray-600">{cp.deviceName} in {cp.roomName}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-500">Average</div>
                  <div className="font-bold">{avg} W</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Peak</div>
                  <div className="font-bold">{max} W</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Minimum</div>
                  <div className="font-bold">{min} W</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprovedControlPointAnalysis;