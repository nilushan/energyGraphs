import React, { useState, useEffect } from 'react';

const TimeHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [selectedControlPoints, setSelectedControlPoints] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [controlPointFilter, setControlPointFilter] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'rooms', 'controlPoints'
  
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  useEffect(() => {
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
    
    // Set default date range based on selected time period
    updateDateRange(timeRange);
  }, []);
  
  useEffect(() => {
    if (controlPoints.length > 0 && dateRange.start && dateRange.end) {
      generateData();
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
        startDate.setDate(endDate.getDate() - 7);
    }
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    setTimeRange(range);
  };
  
  const generateData = () => {
    setIsLoading(true);
    
    // Generate sample data for the heatmap
    // In a real implementation, this would come from API
    const data = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const row = { hour: hour };
      
      for (let day = 0; day < 7; day++) {
        let usage = 0;
        
        // Only include data from selected control points and rooms
        const filteredControlPoints = controlPoints.filter(cp => 
          selectedControlPoints.includes(cp.id) && 
          selectedRooms.includes(cp.roomName)
        );
        
        // Scale factor based on number of control points
        const scaleFactor = filteredControlPoints.length / 15; // Normalize to 15 control points
        
        // Weekend pattern
        if (day >= 5) {
          if (hour >= 9 && hour < 23) {
            // Higher daytime usage on weekends
            usage = 300 * scaleFactor + Math.random() * 200;
          } else {
            // Lower nighttime usage
            usage = 100 * scaleFactor + Math.random() * 100;
          }
        } 
        // Weekday pattern
        else {
          if ((hour >= 6 && hour < 9) || (hour >= 17 && hour < 22)) {
            // Morning and evening peaks on weekdays
            usage = 400 * scaleFactor + Math.random() * 250;
          } else if (hour >= 9 && hour < 17) {
            // Lower during work hours
            usage = 150 * scaleFactor + Math.random() * 100;
          } else {
            // Lowest overnight
            usage = 100 * scaleFactor + Math.random() * 50;
          }
        }
        
        row[daysOfWeek[day]] = Math.round(usage);
      }
      
      data.push(row);
    }
    
    setHeatmapData(data);
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
  
  // Get unique rooms
  const uniqueRooms = [...new Set(controlPoints.map(cp => cp.roomName))];
  
  // Filter control points based on search term
  const filteredControlPoints = controlPoints.filter(cp => 
    cp.name.toLowerCase().includes(controlPointFilter.toLowerCase()) ||
    cp.roomName.toLowerCase().includes(controlPointFilter.toLowerCase())
  );
  
  // Calculate color based on usage value
  const getColor = (value) => {
    // Set color ranges based on usage
    if (value < 150) return 'bg-green-100';
    if (value < 250) return 'bg-green-300';
    if (value < 350) return 'bg-yellow-200';
    if (value < 450) return 'bg-yellow-400';
    if (value < 550) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly Power Usage Patterns</h2>
      
      {/* Time range controls */}
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
      
      {/* View mode controls */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">View Mode:</label>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'rooms' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('rooms')}
            >
              By Room
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'controlPoints' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('controlPoints')}
            >
              By Control Point
            </button>
          </div>
        </div>
      </div>
      
      {/* Room selection */}
      {(viewMode === 'all' || viewMode === 'rooms') && (
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
      )}
      
      {/* Control points selection */}
      {(viewMode === 'all' || viewMode === 'controlPoints') && (
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
      )}
      
      {/* Heatmap */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p>Loading data...</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-100">Hour</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border px-2 py-1 bg-gray-100">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1 text-center bg-gray-50">
                    {row.hour}:00
                  </td>
                  {daysOfWeek.map(day => (
                    <td 
                      key={`${index}-${day}`} 
                      className={`border px-2 py-1 text-center text-xs ${getColor(row[day])}`}
                      title={`${day} ${row.hour}:00 - ${row[day]} W`}
                    >
                      {row[day]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Color legend */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm">Low Usage</div>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-green-100"></div>
          <div className="w-4 h-4 bg-green-300"></div>
          <div className="w-4 h-4 bg-yellow-200"></div>
          <div className="w-4 h-4 bg-yellow-400"></div>
          <div className="w-4 h-4 bg-orange-400"></div>
          <div className="w-4 h-4 bg-red-500"></div>
        </div>
        <div className="text-sm">High Usage</div>
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
        <p>This heatmap shows your energy usage patterns throughout the week. Darker colors indicate higher power consumption. Notice the morning and evening peaks on weekdays, and the different pattern on weekends.</p>
        
        <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100">
          <h4 className="font-medium text-blue-800">Potential Savings Tip:</h4>
          <p className="text-blue-700">Consider shifting energy-intensive activities away from peak usage times (mornings 6-9 AM and evenings 5-10 PM) when possible to reduce overall consumption.</p>
        </div>
      </div>
    </div>
  );
};

export default TimeHeatmap;