import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyComparisonChart = () => {
  const [data, setData] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [dateRange, setDateRange] = useState({
    current: { start: '', end: '' },
    previous: { start: '', end: '' }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'currentWeek', 'previousWeek'
  const [comparisonType, setComparisonType] = useState('daily'); // 'daily', 'total'
  const [controlPointFilter, setControlPointFilter] = useState('');
  const [improvementPct, setImprovementPct] = useState(0);
  
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
    
    // Initially select a subset of control points (first 15)
    setSelectedControlPoints(generatedControlPoints.slice(0, 15).map(cp => cp.id));
    
    // Set all rooms as selected initially
    setSelectedRooms([...new Set(generatedControlPoints.map(cp => cp.roomName))]);
    
    // Calculate current and previous week date ranges
    updateDateRanges();
  }, []);
  
  useEffect(() => {
    if (controlPoints.length > 0 && dateRange.current.start) {
      const selectedCPs = controlPoints.filter(cp => 
        selectedControlPoints.includes(cp.id) && 
        selectedRooms.includes(cp.roomName)
      );
      generateData(selectedCPs);
    }
  }, [selectedControlPoints, selectedRooms, dateRange, viewMode, comparisonType]);
  
  const updateDateRanges = () => {
    // Calculate current week range (most recent Sunday through Saturday)
    const today = new Date();
    const currentWeekEnd = new Date(today);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Adjust to most recent Saturday
    if (dayOfWeek !== 6) { // If not Saturday
      currentWeekEnd.setDate(today.getDate() - dayOfWeek - 1 + 7);
    }
    
    const currentWeekStart = new Date(currentWeekEnd);
    currentWeekStart.setDate(currentWeekEnd.getDate() - 6);
    
    // Calculate previous week range
    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
    
    const previousWeekStart = new Date(previousWeekEnd);
    previousWeekStart.setDate(previousWeekEnd.getDate() - 6);
    
    setDateRange({
      current: {
        start: currentWeekStart.toISOString().split('T')[0],
        end: currentWeekEnd.toISOString().split('T')[0]
      },
      previous: {
        start: previousWeekStart.toISOString().split('T')[0],
        end: previousWeekEnd.toISOString().split('T')[0]
      }
    });
  };
  
  const generateData = (selectedCPs) => {
    setIsLoading(true);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const generateUsagePattern = (isCurrentWeek) => {
      return days.map((day, index) => {
        // Create realistic patterns with weekly variations
        let baseUsage = 0;
        switch (index) {
          case 0: // Sunday
            baseUsage = 6.8; // Higher home usage on weekends
            break;
          case 6: // Saturday
            baseUsage = 7.2; // Higher home usage on weekends
            break;
          case 1: // Monday
          case 5: // Friday
            baseUsage = 5.5;
            break;
          default: // Tue-Thu
            baseUsage = 5.0;
        }
        
        // Factor in control points selected
        baseUsage = baseUsage * (selectedCPs.length / 15); // Normalize to 15 control points
        
        // Add some randomness
        const randomFactor = 0.9 + Math.random() * 0.2; // 90% to 110%
        
        // Previous week typically has slightly higher usage to show improvement
        const weekFactor = isCurrentWeek ? 1.0 : 1.1;
        
        return Math.round(baseUsage * weekFactor * randomFactor * 10) / 10;
      });
    };
    
    // Generate usage data for both weeks
    const currentWeekUsage = generateUsagePattern(true);
    const previousWeekUsage = generateUsagePattern(false);
    
    // Calculate total and average for both weeks
    const currentTotal = currentWeekUsage.reduce((sum, val) => sum + val, 0);
    const previousTotal = previousWeekUsage.reduce((sum, val) => sum + val, 0);
    const currentAvg = Math.round((currentTotal / 7) * 10) / 10;
    const previousAvg = Math.round((previousTotal / 7) * 10) / 10;
    
    // Calculate change percentages
    const totalChange = Math.round((currentTotal - previousTotal) / previousTotal * 1000) / 10;
    
    if (comparisonType === 'daily') {
      // Daily comparison data
      const dailyData = days.map((day, index) => ({
        day,
        'This Week': currentWeekUsage[index],
        'Last Week': previousWeekUsage[index],
        change: Math.round((currentWeekUsage[index] - previousWeekUsage[index]) / previousWeekUsage[index] * 1000) / 10
      }));
      
      setData(dailyData);
      
      // Calculate overall improvement
      const avgImprovement = dailyData.reduce((sum, day) => sum + (day.change < 0 ? Math.abs(day.change) : -day.change), 0) / 7;
      setImprovementPct(Math.round(avgImprovement * 10) / 10);
    } else {
      // Total comparison data
      const totalData = [
        { 
          name: 'This Week',
          total: Math.round(currentTotal * 10) / 10,
          average: currentAvg
        },
        { 
          name: 'Last Week',
          total: Math.round(previousTotal * 10) / 10,
          average: previousAvg
        }
      ];
      
      setData(totalData);
      
      // Calculate improvement
      const improvement = Math.round((previousTotal - currentTotal) / previousTotal * 1000) / 10;
      setImprovementPct(improvement);
    }
    
    setIsLoading(false);
  };
  
  const handleDateChange = (period, field, e) => {
    setDateRange({
      ...dateRange,
      [period]: {
        ...dateRange[period],
        [field]: e.target.value
      }
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
  
  // Determine if overall improvement or not
  const isImprovement = improvementPct > 0;
  
  // Get daily changes for the list
  const dailyChanges = comparisonType === 'daily' ? 
    data.filter(item => item.change !== 0)
        .map(item => ({
          day: item.day,
          change: item.change,
          isDecrease: item.change < 0
        })) : [];
        
  // Get unique rooms
  const uniqueRooms = [...new Set(controlPoints.map(cp => cp.roomName))];
  
  // Filter control points based on search term
  const filteredControlPoints = controlPoints.filter(cp => 
    cp.name.toLowerCase().includes(controlPointFilter.toLowerCase()) ||
    cp.roomName.toLowerCase().includes(controlPointFilter.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly Usage Comparison</h2>
      
      {/* View controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Comparison Type:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${comparisonType === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setComparisonType('daily')}
            >
              Daily
            </button>
            <button 
              className={`px-3 py-1 text-sm ${comparisonType === 'total' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setComparisonType('total')}
            >
              Total
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">View:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('all')}
            >
              Both Weeks
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'currentWeek' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('currentWeek')}
            >
              This Week
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'previousWeek' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('previousWeek')}
            >
              Last Week
            </button>
          </div>
        </div>
      </div>
      
      {/* Date range selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border rounded p-3">
          <h3 className="text-sm font-medium mb-2">Current Week:</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="date" 
              value={dateRange.current.start}
              onChange={(e) => handleDateChange('current', 'start', e)}
              className="border rounded p-1 text-sm"
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.current.end}
              onChange={(e) => handleDateChange('current', 'end', e)}
              className="border rounded p-1 text-sm"
            />
          </div>
        </div>
        
        <div className="border rounded p-3">
          <h3 className="text-sm font-medium mb-2">Previous Week:</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="date" 
              value={dateRange.previous.start}
              onChange={(e) => handleDateChange('previous', 'start', e)}
              className="border rounded p-1 text-sm"
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.previous.end}
              onChange={(e) => handleDateChange('previous', 'end', e)}
              className="border rounded p-1 text-sm"
            />
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
      
      {/* Chart */}
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>Loading data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {comparisonType === 'daily' ? (
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [`${value} kWh`, name]}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Legend />
                {(viewMode === 'all' || viewMode === 'currentWeek') && (
                  <Bar dataKey="This Week" fill="#82ca9d" />
                )}
                {(viewMode === 'all' || viewMode === 'previousWeek') && (
                  <Bar dataKey="Last Week" fill="#8884d8" />
                )}
              </BarChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [`${value} kWh`, 'Power Usage']}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar dataKey="total" name="Total Usage (kWh)" fill="#82ca9d" />
                <Bar dataKey="average" name="Daily Average (kWh)" fill="#8884d8" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Weekly comparison summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg border ${isImprovement ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <h3 className="font-medium text-gray-800">Overall Comparison</h3>
          <p className={`text-lg font-bold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
            {isImprovement ? (
              <span>↓ {improvementPct}% decrease in energy usage</span>
            ) : (
              <span>↑ {Math.abs(improvementPct)}% increase in energy usage</span>
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Compared to the previous week of {dateRange.previous.start} to {dateRange.previous.end}
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <h3 className="font-medium text-blue-800">Day-by-Day Analysis</h3>
          {comparisonType === 'daily' && (
            <div className="mt-2 text-sm">
              <div className="max-h-20 overflow-y-auto">
                <ul className="space-y-1">
                  {dailyChanges.map((item, index) => (
                    <li key={index} className={item.isDecrease ? "text-green-600" : "text-red-600"}>
                      {item.day}: {item.isDecrease ? "↓" : "↑"} {Math.abs(item.change)}% {item.isDecrease ? "decrease" : "increase"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {comparisonType === 'total' && data.length >= 2 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-sm text-blue-700">This Week Total:</p>
                <p className="font-medium">{data[0].total} kWh</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Last Week Total:</p>
                <p className="font-medium">{data[1].total} kWh</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">This Week Average:</p>
                <p className="font-medium">{data[0].average} kWh/day</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Last Week Average:</p>
                <p className="font-medium">{data[1].average} kWh/day</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Data collection information */}
      <div className="mt-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">Current Period:</span> {dateRange.current.start} to {dateRange.current.end}
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
        <p>Compare your current week's energy usage with last week. {isImprovement ? 'Your energy consumption has decreased overall.' : 'Your energy consumption has increased compared to last week.'}</p>
        
        {isImprovement && (
          <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg">
            <h4 className="font-medium text-green-800">Keep up the good work!</h4>
            <p className="text-green-700">Continue your energy-saving habits to further reduce consumption.</p>
          </div>
        )}
        
        {!isImprovement && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
            <h4 className="font-medium text-amber-800">Energy-Saving Tips:</h4>
            <ul className="list-disc ml-5 mt-1 text-amber-700">
              <li>Try to minimize appliance usage during peak hours (6-9 AM and 5-10 PM)</li>
              <li>Adjust thermostat settings by 1-2 degrees</li>
              <li>Turn off lights and devices when not in use</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyComparisonChart;