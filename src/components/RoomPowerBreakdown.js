import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RoomPowerBreakdown = () => {
  const [data, setData] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [timeRange, setTimeRange] = useState('day');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [controlPointFilter, setControlPointFilter] = useState('');
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4'];
  
  useEffect(() => {
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
  }, [selectedControlPoints, selectedRooms, dateRange.start, dateRange.end, timeRange]);
  
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
    
    // Group control points by room
    const roomData = {};
    
    selectedCPs.forEach(cp => {
      if (!roomData[cp.roomName]) {
        roomData[cp.roomName] = {
          name: cp.roomName,
          value: 0,
          controlPoints: []
        };
      }
      
      // Generate realistic usage values based on room type
      let usage = 0;
      
      if (cp.roomName === 'Kitchen') {
        usage = 350 + Math.random() * 150;
      } else if (cp.roomName === 'Living Room') {
        usage = 250 + Math.random() * 100;
      } else if (cp.roomName === 'Master Bedroom') {
        usage = 180 + Math.random() * 50;
      } else if (cp.roomName === 'Bathroom') {
        usage = 150 + Math.random() * 50;
      } else if (cp.roomName === 'Home Office') {
        usage = 200 + Math.random() * 80;
      } else if (cp.roomName === 'Laundry Room') {
        usage = 120 + Math.random() * 150;
      } else if (cp.roomName === 'Garage') {
        usage = 80 + Math.random() * 40;
      } else {
        usage = 100 + Math.random() * 50;
      }
      
      // Time range factor - longer time ranges have higher total usage
      let timeRangeFactor = 1;
      if (timeRange === 'week') timeRangeFactor = 7;
      else if (timeRange === 'month') timeRangeFactor = 30;
      
      usage = Math.round(usage * timeRangeFactor);
      
      roomData[cp.roomName].value += usage;
      roomData[cp.roomName].controlPoints.push({
        ...cp,
        usage
      });
    });
    
    // Convert to array and sort by usage
    const sortedData = Object.values(roomData).sort((a, b) => b.value - a.value);
    
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
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Calculate total usage
  const totalUsage = data.reduce((sum, room) => sum + room.value, 0);
  
  // Get unique rooms
  const uniqueRooms = [...new Set(controlPoints.map(cp => cp.roomName))];
  
  // Filter control points based on search term
  const filteredControlPoints = controlPoints.filter(cp => 
    cp.name.toLowerCase().includes(controlPointFilter.toLowerCase()) ||
    cp.roomName.toLowerCase().includes(controlPointFilter.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Room-by-Room Power Breakdown</h2>
      
      {/* Time range selector */}
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
      
      {/* Chart and Data Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} kWh`, 'Power Usage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="h-64 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((room, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">{room.value} kWh</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                    {((room.value / totalUsage) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-medium">
                <td className="px-3 py-2 whitespace-nowrap text-sm">Total</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">{totalUsage} kWh</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
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
            <span className="font-medium">Control Points:</span> {selectedControlPoints.length} selected
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This chart shows how power consumption is distributed across different rooms in your home. The kitchen and living room typically consume the most power in most households due to major appliances and electronics.</p>
        <p className="mt-2">Use this breakdown to identify which rooms to focus on for energy savings.</p>
      </div>
    </div>
  );
};

export default RoomPowerBreakdown;