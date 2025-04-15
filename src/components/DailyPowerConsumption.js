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
  const [displayMode, setDisplayMode] = useState('rooms'); // 'rooms' or 'controlPoints'

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
    
    // Set all rooms as selected initially
    const allRooms = [...new Set(generatedControlPoints.map(cp => cp.roomName))];
    setSelectedRooms(allRooms);
    
    // Select all control points from all rooms
    const allControlPointIds = generatedControlPoints.map(cp => cp.id);
    setSelectedControlPoints(allControlPointIds);
    
    generateData(generatedControlPoints);
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
      
      // Initialize room totals
      const roomTotals = {};
      selectedRooms.forEach(room => {
        roomTotals[`room_${room.replace(/\s+/g, '_')}`] = 0;
      });

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
        
        const roundedUsage = Math.round(usage * 10) / 10;
        dataPoint[cp.id] = roundedUsage;
        dataPoint.total += roundedUsage;
        
        // Add to room total
        const roomKey = `room_${cp.roomName.replace(/\s+/g, '_')}`;
        roomTotals[roomKey] = (roomTotals[roomKey] || 0) + roundedUsage;
      });
      
      // Add room totals to dataPoint
      Object.entries(roomTotals).forEach(([key, value]) => {
        dataPoint[key] = Math.round(value * 10) / 10;
      });
      
      // Round total
      dataPoint.total = Math.round(dataPoint.total * 10) / 10;
      sampleData.push(dataPoint);
    }
    
    setData(sampleData);
    setIsLoading(false);
  };

  const handleRoomToggle = (roomName) => {
    const isCurrentlySelected = selectedRooms.includes(roomName);
    
    // Update selected rooms
    setSelectedRooms(prev => 
      isCurrentlySelected
        ? prev.filter(r => r !== roomName)
        : [...prev, roomName]
    );
    
    // Update control points for the room
    const roomCPs = controlPoints
      .filter(cp => cp.roomName === roomName)
      .map(cp => cp.id);
      
    setSelectedControlPoints(prev => {
      if (isCurrentlySelected) {
        // Remove control points for this room
        return prev.filter(id => {
          const cp = controlPoints.find(cp => cp.id === id);
          return cp && cp.roomName !== roomName;
        });
      } else {
        // Add control points for this room
        const existing = prev.filter(id => !controlPoints.find(cp => cp.id === id && cp.roomName === roomName));
        return [...existing, ...roomCPs];
      }
    });
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
  
  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };

  const selectAllRooms = () => {
    setSelectedRooms([...new Set(controlPoints.map(cp => cp.roomName))]);
    setSelectedControlPoints([...new Set(controlPoints.map(cp => cp.id))]);
  };
  
  const deselectAllRooms = () => {
    setSelectedRooms([]);
    setSelectedControlPoints([]);
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
      
      {/* Date selector and display mode selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Display:</label>
            <select
              value={displayMode}
              onChange={(e) => handleDisplayModeChange(e.target.value)}
              className="border rounded p-1 text-sm"
            >
              <option value="total">Total Only</option>
              <option value="rooms">Rooms</option>
              <option value="controlPoints">Control Points</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Total Usage: {Math.round(totalDailyUsage * 10) / 10} kWh
        </div>
      </div>

      {/* Room and Control Point selection sections - only show if not in total mode */}
      {displayMode !== 'total' && (
        <>
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
                <button
                  key={room}
                  onClick={() => handleRoomToggle(room)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedRooms.includes(room)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {room}
                </button>
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
        </>
      )}
      
      {/* Chart */}
      <div className="h-96 mt-4">
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
                  if (name.startsWith('room_')) {
                    const roomName = name.replace('room_', '').replace(/_/g, ' ');
                    return [`${value} W`, `${roomName} Total`];
                  }
                  const cp = controlPoints.find(cp => cp.id === name);
                  return [`${value} W`, cp ? cp.name : name];
                }}
              />
              <Legend 
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value) => {
                  if (value === 'total') return 'Total Power Usage';
                  if (value.startsWith('room_')) {
                    return value.replace('room_', '').replace(/_/g, ' ') + ' Total';
                  }
                  const cp = controlPoints.find(cp => cp.id === value);
                  return cp ? cp.name : value;
                }}
                wrapperStyle={{
                  paddingTop: '20px',
                  overflowY: 'auto',
                  maxHeight: '100px',
                  width: '100%'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name="total"
              />
              {displayMode === 'rooms' && selectedRooms.map((room, index) => {
                const colors = ['#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
                return (
                  <Line 
                    key={`room_${room}`}
                    type="monotone" 
                    dataKey={`room_${room.replace(/\s+/g, '_')}`} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2}
                    name={`room_${room.replace(/\s+/g, '_')}`}
                  />
                );
              })}
              {displayMode === 'controlPoints' && selectedControlPoints.map((cpId, index) => {
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