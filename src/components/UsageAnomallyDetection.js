import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const UsageAnomalyDetection = () => {
  const [data, setData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedRange, setSelectedRange] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [controlPointFilter, setControlPointFilter] = useState('');
  const [sensitivityLevel, setSensitivityLevel] = useState('medium'); // low, medium, high
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Generate sample control points
    const sampleRooms = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Home Office', 'Guest Bedroom', 'Dining Room', 'Hallway', 'Laundry Room', 'Garage'];
    const deviceTypes = ['Light', 'Outlet', 'Switch', 'Thermostat', 'Fan', 'TV', 'Refrigerator', 'Oven', 'Microwave', 'Washer', 'Dryer', 'Computer'];
    
    const generatedControlPoints = [];
    let counter = 1;
    
    sampleRooms.forEach(room => {
      const devicesPerRoom = Math.floor(3 + Math.random() * 8); // 3-10 devices per room
      
      for (let i = 0; i < devicesPerRoom; i++) {
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const deviceNumber = Math.floor(Math.random() * 3) + 1;
        
        generatedControlPoints.push({
          id: `cp${counter}`,
          name: `${room} ${deviceType} ${deviceNumber}`,
          deviceName: `${deviceType} ${deviceNumber}`,
          roomName: room
        });
        
        counter++;
      }
    });
    
    setControlPoints(generatedControlPoints);
    
    // Initially select a subset of control points (first 5)
    setSelectedControlPoints(generatedControlPoints.slice(0, 5).map(cp => cp.id));
    
    // Set all rooms as selected initially
    setSelectedRooms([...new Set(generatedControlPoints.map(cp => cp.roomName))]);
    
    // Set default date range based on selected time period
    updateDateRange(selectedRange);
  }, []);
  
  useEffect(() => {
    if (controlPoints.length > 0 && dateRange.start && dateRange.end) {
      const selectedCPs = controlPoints.filter(cp => 
        selectedControlPoints.includes(cp.id) && 
        selectedRooms.includes(cp.roomName)
      );
      generateData(selectedCPs);
    }
  }, [selectedControlPoints, selectedRooms, dateRange.start, dateRange.end, selectedRange, sensitivityLevel]);
  
  const updateDateRange = (range) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    setSelectedRange(range);
  };
  
  const generateData = (selectedCPs) => {
    setIsLoading(true);
    
    let timePoints = [];
    let labelFormat = '';
    let anomalyThreshold = 0;
    
    // Define data points based on selected range
    switch(selectedRange) {
      case 'day':
        // 24 hours with hourly readings
        timePoints = Array.from({ length: 24 }, (_, i) => {
          const date = new Date(dateRange.start);
          date.setHours(i);
          return date;
        });
        labelFormat = 'hour';
        anomalyThreshold = sensitivityLevel === 'low' ? 150 : 
                          sensitivityLevel === 'medium' ? 100 : 70;
        break;
      case 'week':
        // Past 7 days with 3-hour intervals
        timePoints = Array.from({ length: 7 * 8 }, (_, i) => {
          const date = new Date(dateRange.start);
          date.setHours(Math.floor(i / 8) * 24 + (i % 8) * 3);
          return date;
        });
        labelFormat = '3hr';
        anomalyThreshold = sensitivityLevel === 'low' ? 120 : 
                          sensitivityLevel === 'medium' ? 80 : 50;
        break;
      case 'month':
        // Past 30 days with daily readings
        timePoints = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(dateRange.start);
          date.setDate(date.getDate() + i);
          return date;
        });
        labelFormat = 'day';
        anomalyThreshold = sensitivityLevel === 'low' ? 100 : 
                          sensitivityLevel === 'medium' ? 70 : 40;
        break;
      default:
        timePoints = Array.from({ length: 24 }, (_, i) => {
          const date = new Date(dateRange.start);
          date.setHours(i);
          return date;
        });
        labelFormat = 'hour';
        anomalyThreshold = 100;
    }
    
    // Scale factor based on number of selected control points
    const scaleFactor = selectedCPs.length / 5; // Normalize to 5 control points
    
    // Generate sample usage data with baseline and some anomalies
    const sampleData = [];
    const detectAnomalies = [];
    
    const getNormalUsage = (date) => {
      // Create a realistic pattern based on time
      let baselineUsage;
      
      if (labelFormat === 'hour' || labelFormat === '3hr') {
        const hour = date.getHours();
        // Daily pattern with morning and evening peaks
        if (hour >= 6 && hour < 9) {
          baselineUsage = 250 * scaleFactor + Math.random() * 50; // Morning peak
        } else if (hour >= 17 && hour < 22) {
          baselineUsage = 300 * scaleFactor + Math.random() * 50; // Evening peak
        } else if (hour >= 0 && hour < 6) {
          baselineUsage = 80 * scaleFactor + Math.random() * 20; // Night - low usage
        } else {
          baselineUsage = 150 * scaleFactor + Math.random() * 30; // Day - medium usage
        }
      } else {
        // Daily pattern with weekday/weekend differences
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          baselineUsage = 300 * scaleFactor + Math.random() * 50;
        } else { // Weekday
          baselineUsage = 200 * scaleFactor + Math.random() * 40;
        }
      }
      
      return Math.round(baselineUsage);
    };
    
    // Insert some anomalies randomly
    const anomalyPoints = [];
    const numAnomalies = selectedRange === 'month' ? 3 : (selectedRange === 'week' ? 2 : 1);
    
    for (let i = 0; i < numAnomalies; i++) {
      const anomalyIndex = Math.floor(Math.random() * (timePoints.length * 0.7)) + Math.floor(timePoints.length * 0.2);
      anomalyPoints.push(anomalyIndex);
    }
    
    // Create the data with anomalies
    timePoints.forEach((date, index) => {
      let normalUsage = getNormalUsage(date);
      let actualUsage = normalUsage;
      let isAnomaly = false;
      
      // Apply anomaly if this is an anomaly point
      if (anomalyPoints.includes(index)) {
        // Spike the usage
        actualUsage = normalUsage * (1.5 + Math.random());
        isAnomaly = true;
      } else if (anomalyPoints.includes(index - 1) && Math.random() > 0.5) {
        // Sometimes continue the anomaly
        actualUsage = normalUsage * (1.3 + Math.random() * 0.2);
        isAnomaly = actualUsage > (normalUsage + anomalyThreshold);
      }
      
      let label = '';
      if (labelFormat === 'hour') {
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (labelFormat === '3hr') {
        label = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.getHours()}:00`;
      } else {
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      const dataPoint = {
        time: label,
        timestamp: date.toISOString(),
        expected: normalUsage,
        actual: Math.round(actualUsage),
        isAnomaly
      };
      
      sampleData.push(dataPoint);
      
      if (isAnomaly) {
        detectAnomalies.push({
          time: label,
          timestamp: date.toISOString(),
          usage: Math.round(actualUsage),
          expected: normalUsage,
          difference: Math.round(actualUsage - normalUsage),
          percentIncrease: Math.round((actualUsage - normalUsage) / normalUsage * 100)
        });
      }
    });
    
    setData(sampleData);
    setAnomalies(detectAnomalies);
    setIsLoading(false);
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRoomToggle = (roomName) => {
    setSelectedRooms(prev => 
      prev.includes(roomName)
        ? prev.filter(r => r !== roomName)
        : [...prev, roomName]
    );
  };
  
  const handleControlPointToggle = (cpId) => {
    setSelectedControlPoints(prev => 
      prev.includes(cpId)
        ? prev.filter(id => id !== cpId)
        : [...prev, cpId]
    );
  };
  
  const selectAllRooms = () => {
    setSelectedRooms([...new Set(controlPoints.map(cp => cp.roomName))]);
  };
  
  const deselectAllRooms = () => {
    setSelectedRooms([]);
  };
  
  const selectRoomControlPoints = (roomName) => {
    const roomCPs = controlPoints
      .filter(cp => cp.roomName === roomName)
      .map(cp => cp.id);
    
    setSelectedControlPoints(prev => {
      const existing = prev.filter(id => !controlPoints.find(cp => cp.id === id && cp.roomName === roomName));
      return [...existing, ...roomCPs];
    });
  };
  
  const deselectRoomControlPoints = (roomName) => {
    setSelectedControlPoints(prev => 
      prev.filter(id => {
        const cp = controlPoints.find(cp => cp.id === id);
        return cp && cp.roomName !== roomName;
      })
    );
  };
  
  // Get unique rooms
  const uniqueRooms = [...new Set(controlPoints.map(cp => cp.roomName))];
  
  // Filter control points based on search term
  const filteredControlPoints = controlPoints.filter(cp => 
    cp.name.toLowerCase().includes(controlPointFilter.toLowerCase()) ||
    cp.roomName.toLowerCase().includes(controlPointFilter.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Usage Anomaly Detection</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Sensitivity:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${sensitivityLevel === 'low' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSensitivityLevel('low')}
            >
              Low
            </button>
            <button 
              className={`px-3 py-1 text-sm ${sensitivityLevel === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSensitivityLevel('medium')}
            >
              Medium
            </button>
            <button 
              className={`px-3 py-1 text-sm ${sensitivityLevel === 'high' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSensitivityLevel('high')}
            >
              High
            </button>
          </div>
        </div>
      </div>
      
      {/* Time range controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Time Range:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${selectedRange === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => updateDateRange('day')}
            >
              24 Hours
            </button>
            <button 
              className={`px-3 py-1 text-sm ${selectedRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => updateDateRange('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 text-sm ${selectedRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => updateDateRange('month')}
            >
              Month
            </button>
          </div>
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
      
      {/* Room selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Rooms Selected: {selectedRooms.length} of {uniqueRooms.length}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={selectAllRooms}
              className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Select All
            </button>
            <button 
              onClick={deselectAllRooms}
              className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Deselect All
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueRooms.map((room) => (
            <div key={room} className="flex items-center">
              <button
                onClick={() => handleRoomToggle(room)}
                className={`px-2 py-1 text-xs rounded-full ${
                  selectedRooms.includes(room)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {room}
              </button>
              <div className="ml-1 flex">
                <button 
                  onClick={() => selectRoomControlPoints(room)} 
                  className="text-xs text-blue-600 hover:text-blue-800 px-1"
                  title={`Select all control points in ${room}`}
                >
                  +
                </button>
                <button 
                  onClick={() => deselectRoomControlPoints(room)} 
                  className="text-xs text-red-600 hover:text-red-800 px-1"
                  title={`Deselect all control points in ${room}`}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Control points selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Control Points Selected: {selectedControlPoints.length} of {controlPoints.length}</h3>
          <input
            type="text"
            placeholder="Filter control points..."
            value={controlPointFilter}
            onChange={e => setControlPointFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        
        <div className="max-h-32 overflow-y-auto border rounded p-2">
          <div className="flex flex-wrap gap-2">
            {filteredControlPoints.slice(0, 100).map((cp) => (
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
            {filteredControlPoints.length > 100 && (
              <div className="px-2 py-1 text-xs text-gray-500">
                {filteredControlPoints.length - 100} more control points not shown. Use the filter to narrow results.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64">
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
                dataKey="time" 
                interval={selectedRange === 'week' ? 7 : (selectedRange === 'month' ? 4 : 2)} 
              />
              <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [
                `${value} W`, 
                name === 'actual' ? 'Actual Usage' : 'Expected Usage'
              ]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="expected" 
                stroke="#82ca9d" 
                strokeWidth={2} 
                dot={false} 
                name="Expected Usage" 
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={({ isAnomaly }) => isAnomaly}
                activeDot={{ r: 8 }}
                name="Actual Usage" 
              />
              {data
                .filter(entry => entry.isAnomaly)
                .map((entry, index) => (
                  <ReferenceLine 
                    key={`ref-${index}`} 
                    x={entry.time} 
                    stroke="red" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: "Anomaly", 
                      position: "top", 
                      fill: "red", 
                      fontSize: 10 
                    }} 
                  />
                ))
              }
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Anomalies section */}
      {anomalies.length > 0 ? (
        <div className="mt-4">
          <h3 className="font-medium text-red-700">Detected Anomalies ({anomalies.length})</h3>
          <div className="mt-2 overflow-auto max-h-32">
            <table className="min-w-full border-collapse">
              <thead className="bg-red-50">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-red-800">Time</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-red-800">Actual Usage</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-red-800">Expected</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-red-800">Difference</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-red-800">% Increase</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, index) => (
                  <tr key={index} className="border-t border-red-100">
                    <td className="py-2 px-3 text-sm">{anomaly.time}</td>
                    <td className="py-2 px-3 text-sm font-medium">{anomaly.usage} W</td>
                    <td className="py-2 px-3 text-sm">{anomaly.expected} W</td>
                    <td className="py-2 px-3 text-sm">+{anomaly.difference} W</td>
                    <td className="py-2 px-3 text-sm">+{anomaly.percentIncrease}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-green-700">No anomalies detected in your power usage during this period.</p>
        </div>
      )}
      
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
            <span className="font-medium">Control Points:</span> {selectedControlPoints.length} selected
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This tool helps detect unusual spikes in your power consumption that may indicate device malfunctions, forgotten appliances left on, or unauthorized usage. Red vertical lines highlight anomalies.</p>
        
        {anomalies.length > 0 && (
          <div className="mt-2 bg-amber-50 p-2 rounded border border-amber-100">
            <h4 className="font-medium text-amber-800">Possible Causes:</h4>
            <ul className="list-disc pl-5 text-amber-700 text-sm">
              <li>Malfunctioning appliance or device</li>
              <li>Air conditioner or heater running during unoccupied times</li>
              <li>Unauthorized device usage</li>
              <li>Water heater issues</li>
              <li>Multiple high-power devices running simultaneously</li>
            </ul>
          </div>
        )}
        
        <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100">
          <h4 className="font-medium text-blue-800">Sensitivity Level:</h4>
          <p className="text-blue-700">
            {sensitivityLevel === 'low' ? 
              "Low: Only detects major anomalies (over 100W from normal)" : 
            sensitivityLevel === 'medium' ? 
              "Medium: Detects moderate anomalies (70-100W from normal)" :
              "High: Detects minor anomalies (as low as 40W from normal)"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsageAnomalyDetection;