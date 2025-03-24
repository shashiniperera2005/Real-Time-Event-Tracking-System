import React, { useState, useEffect, useCallback } from 'react';
import ConfigurationForm from './components/ConfigurationForm';
import ControlPanel from './components/ControlPanel';
import TicketStatus from './components/TicketStatus';
import LogDisplay from './components/LogDisplay';
import TicketSalesChart from './components/TicketSalesChart';
import './App.css';

function App() {
  const [config, setConfig] = useState(null);   // State to hold configuration data
  const [isRunning, setIsRunning] = useState(false);   // State to track if the system is running
  const [socket, setSocket] = useState(null);  // State to hold WebSocket connection
  const [statusData, setStatusData] = useState({  // State to hold ticket status data
    totalTickets: 0,
    maxCapacity: 0,
    availableTickets: 0,
    totalAdded: 0,
    totalSold: 0,
    remainingToAdd: 0,
  });
  const [vendors, setVendors] = useState([]);  // State to hold vendor data
  const [customers, setCustomers] = useState([]);
  const [salesData, setSalesData] = useState([]);

  const connectWebSocket = useCallback(() => {
    const newSocket = new WebSocket('ws://localhost:5000');

    newSocket.onopen = () => {  // Event handler for when the connection is opened
      console.log('WebSocket connection established');
      setSocket(newSocket);
    };

    newSocket.onmessage = (event) => { 
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStatusData(data.status);
        if (isRunning) {
          setSalesData(prevData => [...prevData, { time: new Date(), sales: data.status.totalSold }]);
        }
      } else if (data.type === 'vendors') {  // Check if the message type is 'vendors'
        setVendors(data.vendors);  
      } else if (data.type === 'customers') {
        setCustomers(data.customers);
      }
    };

    newSocket.onclose = () => {  // Event handler for when the connection is closed
      console.log('WebSocket connection closed');
      setTimeout(connectWebSocket, 5000);
    };

    return () => newSocket.close();
  }, [isRunning]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket, isRunning]);

  const handleConfigSubmit = (configData) => {
    setConfig(configData);
    setStatusData(prevState => ({
      ...prevState,
      totalTickets: configData.totalTickets,
      maxCapacity: configData.maximumTicketCapacity,
      remainingToAdd: configData.totalTickets,
    }));
  };

  const handleStart = () => {
    if (socket && config) {
      socket.send(JSON.stringify({ type: 'start', config }));
      setIsRunning(true);
    }
  };

  const handleStop = () => {  // Handler for stopping the system
    if (socket) {
      socket.send(JSON.stringify({ type: 'stop' }));
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (socket) { // Check if socket is available
      socket.send(JSON.stringify({ type: 'reset' }));
      setIsRunning(false);
      setVendors([]);
      setCustomers([]);   // Clear customers data
      setSalesData([]);
      setStatusData({
        totalTickets: 0,
        maxCapacity: 0,
        availableTickets: 0,
        totalAdded: 0,
        totalSold: 0,
        remainingToAdd: 0,
      });
    }
  };

  return (
    <div className="App">      
      <div className="column">
      <h1>Realtime-Event-Tracking-System</h1>
        <ConfigurationForm onSubmit={handleConfigSubmit} />
        <ControlPanel 
          onStart={handleStart} 
          onStop={handleStop} 
          onReset={handleReset}
          isRunning={isRunning}
        />
        <TicketStatus {...statusData} />
      </div>
      <div className="narrow-column">
        <LogDisplay vendors={vendors} customers={customers} />
        <TicketSalesChart salesData={salesData} isRunning={isRunning} />
      </div>
    </div>
  );
}

export default App;








