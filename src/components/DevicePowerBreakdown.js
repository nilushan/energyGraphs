import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DevicePowerBreakdown = () => {
  const [data, setData] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [timeRange, setTimeRange] = useState('day');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('usage'); // 'usage' or 'name'
  const [controlPointFilter, setControlPointFilter] = useState('');
  
  useEffect(() => {
    // Sample control points with device types - would come from API in a real implementation
    const sampleRooms = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Home Office', 'Guest Bedroom', 'Dining Room', 'Hallway', 'Laundry Room', 'Garage'];
    const deviceTypes = [
      { type: 'Refrigerator', roomName: 'Kitchen', baseUsage: 150 },
      { type: 'Air Conditioner', roomName: 'Living Room', baseUsage: 900 },
      { type: 'Water Heater', roomName: 'Utility Room', baseUsage: 400 },
      { type: 'Washing Machine', roomName: 'Laundry Room', baseUsage: 250 },
      { type: 'Dishwasher', roomName: 'Kitchen', baseUsage: 190 },
      { type: 'TV', roomName: 'Living Room', baseUsage: 90 },
      { type: 'Lighting', roomName: 'Whole House', baseUsage: 120 },
      { type: 'Computer', roomName: 'Home Office', baseUsage: 80 },
      { type: 'Microwave', roomName: 'Kitchen', baseUsage: 70 },
      { type: 'Oven', roomName: 'Kitchen', baseUsage: 240 },
      { type: 'Ceiling Fan', roomName: 'Master Bedroom', baseUsage: 60 },
      { type: 'Game Console', roomName: 'Living Room', baseUsage: 110 },
      { type: 'Router', roomName: 'Home Office', baseUsage: 20 },
      { type: 'Coffee Maker', roomName: 'Kitchen', baseUsage: 40 }
    ];
    
    const generatedControlPoints = [];
    let counter = 1;
    
    // Create a set to keep track of generated devices
    const generatedDevices = new Set();
    
    // First add common devices from the deviceTypes list
    deviceTypes.forEach(deviceType => {
      const roomName = deviceType.roomName;
      
      if (roomName === 'Whole House') {
        sampleRooms.forEach((room, idx) => {
          if (idx < 5) { // Add to first 5 rooms only
            const name = `${room} ${deviceType.type}`;
            const id = `cp${counter}`;
            generatedControlPoints.push({
              id,
              name,
              deviceName: deviceType.type,
              roomName: room,
              baseUsage: deviceType.baseUsage * 0.8 + Math.random() * deviceType.baseUsage * 0.4 // 80-120% of base
            });
            counter++;
            generatedDevices.add(`${room}-${deviceType.type}`);
          }
        });
      } else {
        const name = `${roomName} ${deviceType.type}`;
        const id = `cp${counter}`;
        generatedControlPoints.push({
          id,
          name,
          deviceName: deviceType.type,
          roomName,
          baseUsage: deviceType.baseUsage * 0.8 + Math.random() * deviceType.baseUsage * 0.4 // 80-120% of base
        });
        counter++;
        generatedDevices.add(`${roomName}-${deviceType.type}`);
      }
    });
    
    // Then add more generic devices to fill up
    sampleRooms.forEach(room => {
      const devicesPerRoom = 3 + Math.floor(Math.random() * 5); // 3-7 more devices per room
      
      for (let i = 0; i < devicesPerRoom; i++) {
        // Choose a random device type from: Light, Outlet, Switch
        const deviceType = ['Light', 'Outlet', 'Switch'][Math.floor(Math.random() * 3)];
        const deviceNumber = Math.floor(Math.random() * 5) + 1;
        const deviceKey = `${room}-${deviceType} ${deviceNumber}`;
        
        // Only add if we haven't already
        if (!generatedDevices.has(deviceKey)) {
          const name = `${room} ${deviceType} ${deviceNumber}`;
          const id = `cp${counter}`;
          const baseUsage = deviceType === 'Light' ? 35 + Math.random() * 25 :
                           deviceType === 'Outlet' ? 50 + Math.random() * 100 :
                           15 + Math.random() * 10;
          
          generatedControlPoints.push({
            id,
            name,
            deviceName: `${deviceType} ${deviceNumber}`,
            roomName: room,
            baseUsage
          });
          
          counter++;
          generatedDevices.add(deviceKey);
        }
      }
    });
    
    setControlPoints(generatedControlPoints);
    
    // Initially select all control points
    setSelectedControlPoints(generatedControlPoints.map(cp => cp.id));
    
    // Set all rooms as selected initially
    setSelectedRooms([...new Set(generatedControlPoints.map(cp => cp.roomName))]);
    
    // Set default date range based on selected time period
    updateDateRange(timeRange);
  }, []);
  
  useEffect(() => {
    if (controlPoints.length > 0 && dateRange.start && dateRange.end) {
      const selectedCPs = controlPoints.filter(cp => 
        selectedControlPoints.includes(cp.id) && 
        selectedRooms.includes(cp.roomName)
      );
      generateData(selectedCPs);
    }
  }, [selectedControlPoints, selectedRooms, timeRange, dateRange.start, dateRange.end, sortBy]);
  
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
        startDate.setDate(endDate.getDate() - 1);
    }
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    setTimeRange(range);
  };
  
  const generateData = (selectedCPs) => {
    setIsLoading(true);
    
    // Time range factor
    let timeRangeFactor = 1;
    if (timeRange === 'week') timeRangeFactor = 7;
    else if (timeRange === 'month') timeRangeFactor = 30;
    
    // Generate data for each control point
    const deviceData = selectedCPs.map(cp => {
      // Apply time range factor and add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% of base usage
      const usage = Math.round(cp.baseUsage * timeRangeFactor * randomFactor);
      
      return {
        id: cp.id,
        name: cp.deviceName,
        fullName: cp.name,
        deviceType: cp.deviceName.split(' ')[0], // Extract device type (e.g., 'Light' from 'Light 1')
        roomName: cp.roomName,
        usage
      };
    });
    
    // Sort the data
    let sortedData;
    if (sortBy === 'usage') {
      sortedData = deviceData.sort((a, b) => b.usage - a.usage);
    } else {
      sortedData = deviceData.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setData(sortedData);
    setIsLoading(false);
  };
  
  const handleTimeRangeChange = (range) => {
    updateDateRange(range);
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
  
  const handleSortChange = (sort) => {
    setSortBy(sort);
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
  
  // Calculate total usage
  const totalUsage = data.reduce((sum, device) => sum + device.usage, 0);
  const usageUnit = timeRange === 'day' ? 'W' : 'kWh';
  
  // Get unique rooms
  const uniqueRooms = [...new Set(controlPoints.map(cp => cp.roomName))];
  
  // Filter control points based on search term
  const filteredControlPoints = controlPoints.filter(cp => 
    cp.name.toLowerCase().includes(controlPointFilter.toLowerCase()) ||
    cp.roomName.toLowerCase().includes(controlPointFilter.toLowerCase()) ||
    cp.deviceName.toLowerCase().includes(controlPointFilter.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Device Power Consumption</h2>
      
      {/* Time range and sort controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Time Range:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${timeRange === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => handleTimeRangeChange('day')}
            >
              24 Hours
            </button>
            <button 
              className={`px-3 py-1 text-sm ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 text-sm ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Sort by:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${sortBy === 'usage' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => handleSortChange('usage')}
            >
              Usage
            </button>
            <button 
              className={`px-3 py-1 text-sm ${sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => handleSortChange('name')}
            >
              Name
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom date range selector */}
      <div className="flex items-center space-x-2 mb-4">
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
            <BarChart
              data={data.slice(0, 15)} // Show top 15 devices
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: usageUnit, position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="name" type="category" width={110} />
              <Tooltip 
                formatter={(value) => [`${value} ${usageUnit}`, 'Power Usage']}
                labelFormatter={(label) => `Device: ${label}`}
              />
              <Legend />
              <Bar dataKey="usage" fill="#82ca9d" name={`Power Usage (${usageUnit})`} />
            </BarChart>
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
            <span className="font-medium">Total Usage:</span> {totalUsage} {usageUnit}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This chart ranks your devices by power consumption. High-consumption devices like air conditioners and water heaters typically offer the most opportunity for energy savings.</p>
        
        <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg">
          <h4 className="font-medium text-green-800">Energy-Saving Tips:</h4>
          <ul className="list-disc ml-5 mt-1 text-green-700">
            <li>Consider upgrading high-usage devices to more energy-efficient models</li>
            <li>Set thermostats to energy-saving temperatures (78°F for cooling, 68°F for heating)</li>
            <li>Use smart plugs to automatically turn off electronics when not in use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DevicePowerBreakdown;