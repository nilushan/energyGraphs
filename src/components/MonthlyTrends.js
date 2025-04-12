import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from 'recharts';

const MonthlyTrend = () => {
  const [data, setData] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  const [displayMode, setDisplayMode] = useState('allControlPoints'); // 'allControlPoints', 'byRoom'
  const [electricityRate, setElectricityRate] = useState(0.25); // Default rate in $ per kWh
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [controlPointFilter, setControlPointFilter] = useState('');
  
  useEffect(() => {
    // Set default date range to past 12 months
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    // Generate sample control points - in a real implementation, this would come from API
    // Generate a larger set of control points to simulate up to 150 in a network
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
    
    // Initially select a manageable subset (first 15 control points)
    setSelectedControlPoints(generatedControlPoints.slice(0, 15).map(cp => cp.id));
    
    // Set all rooms as selected initially
    setSelectedRooms([...new Set(generatedControlPoints.map(cp => cp.roomName))]);
  }, []);
  
  useEffect(() => {
    if (controlPoints.length > 0 && dateRange.start && dateRange.end) {
      generateData();
    }
  }, [selectedControlPoints, selectedRooms, dateRange.start, dateRange.end, electricityRate, displayMode]);
  
  const generateData = () => {
    setIsLoading(true);
    
    // Generate sample data for last 12 months
    // In a real implementation, this would come from API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Calculate number of months in range
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
    const filteredControlPoints = controlPoints.filter(cp => 
      selectedControlPoints.includes(cp.id) && 
      selectedRooms.includes(cp.roomName)
    );
    
    // Scale factor based on number of control points
    const scaleFactor = filteredControlPoints.length / 15; // Normalize to base of 15 control points
    
    if (displayMode === 'allControlPoints') {
      // Generate aggregated data for all control points
      const sampleData = [];
      
      for (let i = 0; i <= monthDiff; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        const monthIndex = date.getMonth();
        let usage;
        
        // Create seasonal patterns
        if (monthIndex >= 5 && monthIndex <= 7) {
          // Summer months - higher usage for cooling
          usage = 350 * scaleFactor + Math.random() * 100;
        } else if (monthIndex >= 11 || monthIndex <= 1) {
          // Winter months - higher usage for heating
          usage = 380 * scaleFactor + Math.random() * 100;
        } else {
          // Spring/Fall - moderate usage
          usage = 220 * scaleFactor + Math.random() * 80;
        }
        
        const cost = Math.round(usage * electricityRate * 100) / 100;
        
        sampleData.push({
          month: `${months[monthIndex]} ${date.getFullYear()}`,
          usage: Math.round(usage * 10) / 10,
          cost
        });
      }
      
      setData(sampleData);
    } else {
      // Group by room
      const roomData = {};
      const uniqueRooms = [...new Set(filteredControlPoints.map(cp => cp.roomName))];
      
      uniqueRooms.forEach(room => {
        roomData[room] = [];
        
        const roomControlPoints = filteredControlPoints.filter(cp => cp.roomName === room);
        const roomScaleFactor = roomControlPoints.length / 5; // Normalize to base of 5 control points per room
        
        for (let i = 0; i <= monthDiff; i++) {
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + i);
          const monthIndex = date.getMonth();
          let usage;
          
          // Different baseline usage patterns per room
          let baseUsage = 0;
          switch(room) {
            case 'Kitchen':
              baseUsage = 120;
              break;
            case 'Living Room':
              baseUsage = 90;
              break;
            case 'Master Bedroom':
              baseUsage = 60;
              break;
            case 'Bathroom':
              baseUsage = 50;
              break;
            case 'Home Office':
              baseUsage = 80;
              break;
            default:
              baseUsage = 40;
          }
          
          // Seasonal adjustments
          let seasonalFactor = 1.0;
          if (monthIndex >= 5 && monthIndex <= 7) {
            // Summer months
            seasonalFactor = 1.3;
          } else if (monthIndex >= 11 || monthIndex <= 1) {
            // Winter months
            seasonalFactor = 1.4;
          }
          
          usage = baseUsage * seasonalFactor * roomScaleFactor + Math.random() * (baseUsage * 0.2);
          
          roomData[room].push({
            month: `${months[monthIndex]} ${date.getFullYear()}`,
            room,
            usage: Math.round(usage * 10) / 10,
            cost: Math.round(usage * electricityRate * 100) / 100
          });
        }
      });
      
      // Combine all room data into a single array
      const combinedData = [];
      
      // Ensure we have data points for every month in our range
      for (let i = 0; i <= monthDiff; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        const monthData = {
          month: monthLabel,
          totalUsage: 0,
          totalCost: 0
        };
        
        // Add usage data for each room
        uniqueRooms.forEach(room => {
          const roomMonthData = roomData[room].find(d => d.month === monthLabel);
          if (roomMonthData) {
            monthData[`${room}_usage`] = roomMonthData.usage;
            monthData.totalUsage += roomMonthData.usage;
            monthData.totalCost += roomMonthData.cost;
          }
        });
        
        monthData.totalCost = Math.round(monthData.totalCost * 100) / 100;
        monthData.totalUsage = Math.round(monthData.totalUsage * 10) / 10;
        
        combinedData.push(monthData);
      }
      
      setData(combinedData);
    }
    
    setIsLoading(false);
  };
  
  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (!isNaN(newRate) && newRate > 0) {
      setElectricityRate(newRate);
    }
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
  
  // Calculate total usage and cost
  const totalUsage = data.reduce((sum, item) => sum + item.usage, 0);
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const avgMonthlyUsage = Math.round((totalUsage / (data.length || 1)) * 10) / 10;
  const avgMonthlyCost = Math.round((totalCost / (data.length || 1)) * 100) / 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Monthly Power Usage & Cost</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="rate" className="text-sm mr-2">Rate ($/kWh):</label>
            <input
              id="rate"
              type="number"
              value={electricityRate}
              onChange={handleRateChange}
              className="border rounded px-2 py-1 w-16 text-sm"
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>
      
      {/* Date range selection */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Date Range:</label>
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
      
      {/* Display mode selection */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Display:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${displayMode === 'allControlPoints' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setDisplayMode('allControlPoints')}
            >
              Total Usage
            </button>
            <button 
              className={`px-3 py-1 text-sm ${displayMode === 'byRoom' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setDisplayMode('byRoom')}
            >
              By Room
            </button>
          </div>
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
      
      {/* Chart or table view */}
      {viewMode === 'chart' ? (
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
                <XAxis dataKey="month" />
                <YAxis 
                  yAxisId="left" 
                  label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ value: 'Cost ($)', angle: 90, position: 'insideRight' }} 
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'usage' || name.endsWith('_usage') || name === 'totalUsage') 
                      return [`${value} kWh`, name.includes('_usage') ? name.split('_')[0] : 'Usage'];
                    if (name === 'cost' || name === 'totalCost') 
                      return [`$${value}`, 'Cost'];
                    return [value, name];
                  }}
                />
                <Legend />
                
                {displayMode === 'allControlPoints' ? (
                  <>
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="#8884d8" 
                      name="Usage (kWh)" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#82ca9d" 
                      name="Cost ($)" 
                    />
                  </>
                ) : (
                  <>
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="totalUsage" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Total Usage (kWh)" 
                    />
                    {uniqueRooms.filter(room => selectedRooms.includes(room)).slice(0, 5).map((room, index) => {
                      const colors = ['#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
                      return (
                        <Line 
                          key={room}
                          yAxisId="left" 
                          type="monotone" 
                          dataKey={`${room}_usage`} 
                          stroke={colors[index % colors.length]}
                          name={`${room}`}
                          strokeDasharray="3 3"
                        />
                      );
                    })}
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-64">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b border-r">Month</th>
                <th className="py-2 px-4 border-b border-r">Usage (kWh)</th>
                <th className="py-2 px-4 border-b">Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b border-r">{item.month}</td>
                  <td className="py-2 px-4 border-b border-r text-right">
                    {displayMode === 'allControlPoints' ? item.usage : item.totalUsage}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    ${displayMode === 'allControlPoints' ? item.cost.toFixed(2) : item.totalCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium text-sm">Average Monthly Usage</h3>
          <p className="text-lg font-bold">{avgMonthlyUsage} kWh</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium text-sm">Average Monthly Cost</h3>
          <p className="text-lg font-bold">${avgMonthlyCost.toFixed(2)}</p>
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
        <p>This chart shows your monthly power consumption and estimated cost over the selected period. Notice how usage typically increases during summer and winter months due to heating and cooling needs.</p>
        
        <div className="mt-2 bg-amber-50 p-2 rounded border border-amber-100">
          <h4 className="font-medium text-amber-800">Cost-Saving Tips:</h4>
          <ul className="list-disc ml-5 mt-1 text-amber-700">
            <li>Set programmable thermostats to optimize heating and cooling</li>
            <li>Use ceiling fans to reduce air conditioning needs</li>
            <li>Consider switching to LED lighting</li>
            <li>Unplug electronics when not in use to reduce standby power</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTrend;