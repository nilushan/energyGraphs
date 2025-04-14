import React, { useState, useEffect } from 'react';
import { Clock, Power, Settings, Layout, Filter, ChevronDown, ChevronUp, Home, ToggleRight, Lightbulb, Fan, DoorOpen, Zap, Bell, Activity, Send } from 'lucide-react';

const DeviceTimeline = () => {
  // State variables
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterEntityType, setFilterEntityType] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch sample data
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Sample data - in a real implementation, this would come from multiple tables
        const sampleData = [
          // ACTIONS - commands sent to devices (e.g. from deviceControlUpdates table)
          {
            id: 'a1',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            deviceId: 'device-001',
            deviceName: 'Living Room Light',
            deviceType: 'light',
            roomName: 'Living Room',
            entityType: 'action',
            name: 'TurnOn',
            controlLevel: 100,
            initiatedBy: 'user-123',
            initiatorName: 'John Smith',
            details: { brightness: 100, method: 'app' }
          },
          {
            id: 'a2',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
            deviceId: 'device-003',
            deviceName: 'Bedroom Fan',
            deviceType: 'fan',
            roomName: 'Bedroom',
            entityType: 'action',
            name: 'SetSpeed',
            controlLevel: 2,
            initiatedBy: 'user-123',
            initiatorName: 'John Smith',
            details: { speed: 2, method: 'voice' }
          },
          {
            id: 'a3',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            deviceId: 'device-001',
            deviceName: 'Living Room Light',
            deviceType: 'light',
            roomName: 'Living Room',
            entityType: 'action',
            name: 'TurnOff',
            controlLevel: 0,
            initiatedBy: 'system-timer',
            initiatorName: 'Night Mode Timer',
            details: { brightness: 0, method: 'automation' }
          },
          {
            id: 'a4',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            deviceId: 'device-005',
            deviceName: 'Bedroom Curtain',
            deviceType: 'curtain',
            roomName: 'Bedroom',
            entityType: 'action',
            name: 'OpenToPercentage',
            controlLevel: 50,
            initiatedBy: 'user-456',
            initiatorName: 'Jane Doe',
            details: { openPercentage: 50, method: 'app' }
          },
          {
            id: 'a5',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
            deviceId: 'device-006',
            deviceName: 'Office Light',
            deviceType: 'light',
            roomName: 'Office',
            entityType: 'action',
            name: 'TurnOn',
            controlLevel: 80,
            initiatedBy: 'user-123',
            initiatorName: 'John Smith',
            details: { brightness: 80, method: 'switch' }
          },
          
          // EVENTS - state changes reported by devices (e.g. from tsMessages or DeviceFieldUpdates)
          {
            id: 'e1',
            timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(), // 16 minutes ago (just after action)
            deviceId: 'device-001',
            deviceName: 'Living Room Light',
            deviceType: 'light',
            roomName: 'Living Room',
            entityType: 'event',
            name: 'TurnedOn',
            controlLevel: 100,
            previousValue: 0,
            details: { brightness: 100, previousState: 'Off' }
          },
          {
            id: 'e2',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            deviceId: 'device-002',
            deviceName: 'Kitchen Light',
            deviceType: 'light',
            roomName: 'Kitchen',
            entityType: 'event',
            name: 'BrightnessChanged',
            controlLevel: 75,
            previousValue: 100,
            details: { brightness: 75, previousBrightness: 100 }
          },
          {
            id: 'e3',
            timestamp: new Date(Date.now() - 1000 * 60 * 46).toISOString(), // 46 minutes ago (just after action)
            deviceId: 'device-003',
            deviceName: 'Bedroom Fan',
            deviceType: 'fan',
            roomName: 'Bedroom',
            entityType: 'event',
            name: 'SpeedChanged',
            controlLevel: 2,
            previousValue: 1,
            details: { speed: 2, previousSpeed: 1 }
          },
          {
            id: 'e4',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            deviceId: 'device-004',
            deviceName: 'Garage Door',
            deviceType: 'garage',
            roomName: 'Garage',
            entityType: 'event',
            name: 'Opened',
            controlLevel: 100, 
            previousValue: 0,
            details: { openPercentage: 100, previousState: 'Closed' }
          },
          {
            id: 'e5',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
            deviceId: 'device-004',
            deviceName: 'Garage Door',
            deviceType: 'garage',
            roomName: 'Garage',
            entityType: 'event',
            name: 'Closed',
            controlLevel: 0,
            previousValue: 100,
            details: { openPercentage: 0, previousState: 'Open' }
          },
          {
            id: 'e6',
            timestamp: new Date(Date.now() - 1000 * 60 * 121).toISOString(), // 2 hours and 1 minute ago (just after action)
            deviceId: 'device-001',
            deviceName: 'Living Room Light',
            deviceType: 'light',
            roomName: 'Living Room',
            entityType: 'event',
            name: 'TurnedOff',
            controlLevel: 0,
            previousValue: 100,
            details: { brightness: 0, previousState: 'On' }
          },
          {
            id: 'e7',
            timestamp: new Date(Date.now() - 1000 * 60 * 181).toISOString(), // 3 hours and 1 minute ago (just after action)
            deviceId: 'device-005',
            deviceName: 'Bedroom Curtain',
            deviceType: 'curtain',
            roomName: 'Bedroom',
            entityType: 'event',
            name: 'OpenedToPercentage',
            controlLevel: 50,
            previousValue: 0,
            details: { openPercentage: 50, previousPercentage: 0 }
          },
          {
            id: 'e8',
            timestamp: new Date(Date.now() - 1000 * 60 * 242).toISOString(), // 4 hours and 2 minutes ago (just after action)
            deviceId: 'device-006',
            deviceName: 'Office Light',
            deviceType: 'light',
            roomName: 'Office',
            entityType: 'event',
            name: 'TurnedOn',
            controlLevel: 80,
            previousValue: 0,
            details: { brightness: 80, previousState: 'Off' }
          },
          {
            id: 'e9',
            timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
            deviceId: 'device-007',
            deviceName: 'Thermostat',
            deviceType: 'thermostat',
            roomName: 'Living Room',
            entityType: 'event',
            name: 'TemperatureChanged',
            controlLevel: 72,
            previousValue: 70,
            details: { temperature: 72, previousTemperature: 70 }
          },
          {
            id: 'e10',
            timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
            deviceId: 'device-002',
            deviceName: 'Kitchen Light',
            deviceType: 'light',
            roomName: 'Kitchen',
            entityType: 'event',
            name: 'TurnedOff',
            controlLevel: 0,
            previousValue: 75,
            details: { brightness: 0, previousState: 'On' }
          }
        ];
        
        // Sort by timestamp (newest first)
        sampleData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setTimelineData(sampleData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load timeline data');
        setLoading(false);
      }
    }, 1000);
  }, []);

  // Filter the timeline data based on user selections
  const filteredData = timelineData.filter(item => {
    const withinTimeRange = () => {
      const now = Date.now();
      const timestamp = new Date(item.timestamp).getTime();
      const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
      
      switch (timeRange) {
        case '1h': return hoursDiff <= 1;
        case '3h': return hoursDiff <= 3;
        case '12h': return hoursDiff <= 12;
        case '24h': return hoursDiff <= 24;
        case '7d': return hoursDiff <= 168; // 7 * 24
        case '30d': return hoursDiff <= 720; // 30 * 24
        default: return true;
      }
    };

    return (filterDevice === 'all' || item.deviceId === filterDevice) &&
           (filterEntityType === 'all' || item.entityType === filterEntityType) &&
           (filterRoom === 'all' || item.roomName === filterRoom) &&
           (filterType === 'all' || item.deviceType === filterType) &&
           withinTimeRange();
  });

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    return [...new Set(timelineData.map(item => item[key]))];
  };

  const uniqueDevices = getUniqueValues('deviceId').map(id => {
    const device = timelineData.find(item => item.deviceId === id);
    return { id, name: device?.deviceName || id };
  });
  
  const uniqueRooms = getUniqueValues('roomName');
  const uniqueTypes = getUniqueValues('deviceType');

  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get relative time (e.g., "5 minutes ago")
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  // Get icon based on device type
  const getDeviceIcon = (item) => {
    switch (item.deviceType) {
      case 'light':
        return <Lightbulb className={`w-5 h-5 ${item.controlLevel > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />;
      case 'fan':
        return <Fan className={`w-5 h-5 ${item.controlLevel > 0 ? 'text-blue-500' : 'text-gray-400'}`} />;
      case 'garage':
        return <DoorOpen className={`w-5 h-5 ${item.controlLevel > 0 ? 'text-green-500' : 'text-gray-400'}`} />;
      case 'thermostat':
        return <Settings className={`w-5 h-5 text-red-500`} />;
      case 'curtain':
        return <Layout className={`w-5 h-5 ${item.controlLevel > 0 ? 'text-purple-500' : 'text-gray-400'}`} />;
      default:
        return <ToggleRight className={`w-5 h-5 ${item.controlLevel > 0 ? 'text-green-500' : 'text-gray-400'}`} />;
    }
  };

  // Get icon for entity type (action or event)
  const getEntityIcon = (item) => {
    if (item.entityType === 'action') {
      return <Send className="w-4 h-4 text-blue-500" />;
    } else {
      return <Bell className="w-4 h-4 text-green-500" />;
    }
  };

  // Get background color based on entity type
  const getBackgroundColor = (item) => {
    switch (item.entityType) {
      case 'action':
        return 'bg-blue-50 border-blue-200';
      case 'event':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get badge for entity type
  const getEntityTypeBadge = (item) => {
    if (item.entityType === 'action') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Action</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Event</span>;
    }
  };

  // Get text description based on entity type and name
  const getDescription = (item) => {
    if (item.entityType === 'action') {
      // Action descriptions
      switch (item.name) {
        case 'TurnOn':
          return `Turn on command sent`;
        case 'TurnOff':
          return `Turn off command sent`;
        case 'SetBrightness':
          return `Set brightness to ${item.controlLevel}% command sent`;
        case 'SetSpeed':
          return `Set speed to ${item.controlLevel} command sent`;
        case 'OpenToPercentage':
          return `Open to ${item.controlLevel}% command sent`;
        default:
          return `${item.name} command sent (Level: ${item.controlLevel})`;
      }
    } else {
      // Event descriptions
      switch (item.name) {
        case 'TurnedOn':
          return `Turned on`;
        case 'TurnedOff':
          return `Turned off`;
        case 'BrightnessChanged':
          return `Brightness changed to ${item.controlLevel}%`;
        case 'SpeedChanged':
          return `Speed changed to ${item.controlLevel}`;
        case 'Opened':
          return `Opened`;
        case 'Closed':
          return `Closed`;
        case 'OpenedToPercentage':
          return `Opened to ${item.controlLevel}%`;
        case 'TemperatureChanged':
          return `Temperature changed to ${item.controlLevel}°F`;
        default:
          return `${item.name} (Level: ${item.controlLevel})`;
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {error}
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        <Activity className="w-6 h-6 mr-2" />
        Device Timeline
      </h1>
      
      <div className="p-4 rounded-lg mb-6 bg-gray-100 border border-gray-200">
        <div className="text-sm flex justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-gray-700 flex items-center">
                <Send className="w-3 h-3 mr-1" /> Actions
              </span>
              <span className="text-xs text-gray-500 ml-1">(Commands sent to devices)</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-gray-700 flex items-center">
                <Bell className="w-3 h-3 mr-1" /> Events
              </span>
              <span className="text-xs text-gray-500 ml-1">(Status changes reported by devices)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
            <select 
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value)}
            >
              <option value="all">All Devices</option>
              {uniqueDevices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select 
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              value={filterEntityType}
              onChange={(e) => setFilterEntityType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="action">Actions Only</option>
              <option value="event">Events Only</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select 
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            >
              <option value="all">All Rooms</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select 
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select 
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="3h">Last 3 Hours</option>
              <option value="12h">Last 12 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No actions or events match your filters.</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => {
                setFilterDevice('all');
                setFilterEntityType('all');
                setFilterRoom('all');
                setFilterType('all');
                setTimeRange('24h');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Central timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 z-0 transform -translate-x-1/2"></div>
            
            {/* Timeline items */}
            {filteredData.map(item => {
              const isAction = item.entityType === 'action';
              
              return (
                <div 
                  key={item.id} 
                  className={`relative z-10 mb-6 flex items-start ${isAction ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-1/2 top-6 w-4 h-4 rounded-full 
                                   ${isAction ? 'bg-blue-100 border-2 border-blue-400' : 'bg-green-100 border-2 border-green-400'} 
                                   transform -translate-x-1/2 z-20`}>
                  </div>
                  
                  {/* Card for action - left side */}
                  {isAction && (
                    <>
                      <div className={`w-5/12 border rounded-lg overflow-hidden transition-all ${getBackgroundColor(item)}`}>
                        <div 
                          className="p-4 cursor-pointer flex items-start"
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                          <div className="w-12 h-12 rounded-full bg-white flex justify-center items-center border mr-3 flex-shrink-0">
                            {getDeviceIcon(item)}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <h3 className="font-medium text-gray-900">{item.deviceName}</h3>
                                <div className="ml-2">{getEntityTypeBadge(item)}</div>
                              </div>
                            </div>
                            <p className="text-gray-700 flex items-center">
                              {getEntityIcon(item)}
                              <span className="ml-1">{getDescription(item)}</span>
                            </p>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Home className="w-4 h-4 mr-1" />
                              {item.roomName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {getRelativeTime(item.timestamp)}
                            </div>
                          </div>
                          <div className="ml-2">
                            {expandedItem === item.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expandedItem === item.id && (
                          <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                            <div className="text-sm">
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Timestamp:</span>{' '}
                                {formatTime(item.timestamp)}
                              </div>
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Device ID:</span>{' '}
                                {item.deviceId}
                              </div>
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Device Type:</span>{' '}
                                {item.deviceType.charAt(0).toUpperCase() + item.deviceType.slice(1)}
                              </div>
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Control Level:</span>{' '}
                                {item.controlLevel}
                              </div>
                              {item.initiatedBy && (
                                <div className="mb-2">
                                  <span className="font-medium text-gray-700">Initiated By:</span>{' '}
                                  {item.initiatorName} ({item.initiatedBy})
                                </div>
                              )}
                              {item.details && (
                                <div className="mt-2 p-2 rounded bg-white border border-gray-200">
                                  <h4 className="font-medium text-gray-700 mb-1">Additional Details:</h4>
                                  <pre className="text-xs whitespace-pre-wrap">
                                    {JSON.stringify(item.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Connector line from card to timeline */}
                      <div className="w-1/12 relative">
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-blue-300"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Empty space for events (right side items) */}
                  {isAction && <div className="w-5/12"></div>}
                  
                  {/* Empty space for actions (left side items) */}
                  {!isAction && <div className="w-5/12"></div>}
                  
                  {/* Connector line from timeline to card */}
                  {!isAction && (
                    <div className="w-1/12 relative">
                      <div className="absolute top-6 left-0 right-0 h-0.5 bg-green-300"></div>
                    </div>
                  )}
                  
                  {/* Card for event - right side */}
                  {!isAction && (
                    <div className={`w-5/12 border rounded-lg overflow-hidden transition-all ${getBackgroundColor(item)}`}>
                      <div 
                        className="p-4 cursor-pointer flex items-start"
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      >
                        <div className="w-12 h-12 rounded-full bg-white flex justify-center items-center border mr-3 flex-shrink-0">
                          {getDeviceIcon(item)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900">{item.deviceName}</h3>
                              <div className="ml-2">{getEntityTypeBadge(item)}</div>
                            </div>
                          </div>
                          <p className="text-gray-700 flex items-center">
                            {getEntityIcon(item)}
                            <span className="ml-1">{getDescription(item)}</span>
                          </p>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Home className="w-4 h-4 mr-1" />
                            {item.roomName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {getRelativeTime(item.timestamp)}
                          </div>
                        </div>
                        <div className="ml-2">
                          {expandedItem === item.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded details */}
                      {expandedItem === item.id && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                          <div className="text-sm">
                            <div className="mb-2">
                              <span className="font-medium text-gray-700">Timestamp:</span>{' '}
                              {formatTime(item.timestamp)}
                            </div>
                            <div className="mb-2">
                              <span className="font-medium text-gray-700">Device ID:</span>{' '}
                              {item.deviceId}
                            </div>
                            <div className="mb-2">
                              <span className="font-medium text-gray-700">Device Type:</span>{' '}
                              {item.deviceType.charAt(0).toUpperCase() + item.deviceType.slice(1)}
                            </div>
                            <div className="mb-2">
                              <span className="font-medium text-gray-700">Control Level:</span>{' '}
                              {item.controlLevel}
                            </div>
                            {item.previousValue !== undefined && (
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Previous Value:</span>{' '}
                                {item.previousValue}
                              </div>
                            )}
                            {item.details && (
                              <div className="mt-2 p-2 rounded bg-white border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-1">Additional Details:</h4>
                                <pre className="text-xs whitespace-pre-wrap">
                                  {JSON.stringify(item.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredData.length} of {timelineData.length} events
      </div>
    </div>
  );
};

export default DeviceTimeline;