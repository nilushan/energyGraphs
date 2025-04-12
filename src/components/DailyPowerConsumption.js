import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DailyPowerConsumption = () => {
  const [data, setData] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [controlPointFilter, setControlPointFilter] = useState('');
  
  useEffect(() => {
    // Generate the current date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDateRange({ start: formattedDate });
    
    // Sample control points - would come from API in a real implementation
    const sampleRooms = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Home Office', 'Guest Bedroom', 'Dining Room', 'Hallway', 'Laundry Room', 'Garage'];
    const deviceTypes = ['Light', 'Outlet', 'Switch', 'Thermostat', 'Fan', 'Sensor', 'Appliance'];
    
    const generatedControlPoints = [];
    let counter = 1;
    
    sampleRooms.forEach(room => {
      const devicesPerRoom = Math.floor(5 + Math.random() * 10); // 5-15 devices per room
      
      for (let i = 0; i < devicesPerRoom; i++) {
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const deviceNumber = Math.floor(Math.random() * 5) + 1;
        
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
    
    // Initially select a subset of control points (first 15)
    setSelectedControlPoints(generatedControlPoints.slice(0, 15).map(cp => cp.id));
    
    // Set all rooms as selected initially
    setSelectedRooms([...new Set(generatedControlPoints.map(cp => cp.roomName))]);
    
    generateData(generatedControlPoints.slice(0, 15));
  }, []);
  
  useEffect(() => {
    if (controlPoints.length > 0) {
      const selectedCPs = controlPoints.filter(cp => 
        selectedControlPoints.includes(cp.id) && 
        selectedRooms.includes(cp.roomName)
      );
      generateData(selectedCPs);
    }
  }, [selectedControlPoints, selectedRooms, dateRange.start]);
  
  const generateData = (selectedCPs) => {
    setIsLoading(true);
    
    // Generate hourly data for a full day
    const sampleData = [];
    for (let hour = 0; hour < 24; hour++) {
      const dataPoint = {
        hour: `${hour}:00`,
        total: 0
      };
      
      // Generate data for each selected control point
      selectedCPs.forEach(cp => {
        // Create a realistic power consumption pattern
        let usage = 0;
        if (hour >= 6 && hour < 9) {
          // Morning peak
          usage = (cp.roomName === 'Kitchen' || cp.roomName === 'Bathroom') 
            ? 120 + Math.random() * 100 
            : 30 + Math.random() * 50;
        } else if (hour >= 12 && hour < 14) {
          // Lunch time
          usage = cp.roomName === 'Kitchen' 
            ? 100 + Math.random() * 100 
            : 20 + Math.random() * 30;
        } else if (hour >= 17 && hour < 22) {
          // Evening peak
          usage = (cp.roomName === 'Kitchen' || cp.roomName === 'Living Room') 
            ? 150 + Math.random() * 150 
            : 50 + Math.random() * 50;
        } else {
          // Low usage times
          usage = 10 + Math.random() * 40;
        }
        
        dataPoint[cp.id] = Math.round(usage * 10) / 10;
        dataPoint.total += dataPoint[cp.id];
      });
      
      // Round total
      dataPoint.total = Math.round(dataPoint.total * 10) / 10;
      sampleData.push(dataPoint);
    }
    
    setData(sampleData);
    setIsLoading(false);
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
  
  const handleDateChange = (e) => {
    setDateRange({
      start: e.target.value
    });
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
  
  // Get total daily usage
  const totalDailyUsage = data.reduce((sum, point) => sum + point.total, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Daily Power Consumption</h2>
      
      {/* Date selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Date:</label>
          <input 
            type="date" 
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
            className="border rounded p-1 text-sm"
          />
        </div>
        
        <div className="text-sm font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Total Usage: {Math.round(totalDailyUsage * 10) / 10} kWh
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
              <XAxis dataKey="hour" />
              <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'total') return [`${value} W`, 'Total Power Usage'];
                  const cp = controlPoints.find(cp => cp.id === name);
                  return [`${value} W`, cp ? cp.name : name];
                }}
              />
              <Legend formatter={(value) => {
                if (value === 'total') return 'Total Power Usage';
                const cp = controlPoints.find(cp => cp.id === value);
                return cp ? cp.name : value;
              }}/>
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name="total"
              />
              {selectedControlPoints.length <= 5 && selectedControlPoints.map((cpId, index) => {
                // Only show individual lines if 5 or fewer are selected to avoid cluttering
                const colors = ['#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
                return (
                  <Line 
                    key={cpId}
                    type="monotone" 
                    dataKey={cpId} 
                    stroke={colors[index % colors.length]} 
                    strokeDasharray="3 3"
                    name={cpId}
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
            <span className="font-medium">Date:</span> {new Date(dateRange.start).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Data Collection:</span> 15-minute intervals
          </div>
          <div>
            <span className="font-medium">Report Frequency:</span> Hourly
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This graph shows your total home power consumption over a 24-hour period. The solid purple line represents the total usage, while the dashed lines show individual control points (if 5 or fewer are selected).</p>
        <p className="mt-2">Notice the peak usage times in the morning and evening, which typically correspond to increased activity in the kitchen and living areas.</p>
      </div>
    </div>
  );
};

export default DailyPowerConsumption;