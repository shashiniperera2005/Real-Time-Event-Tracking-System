 const fs = require('fs');   // file system operations
const path = require('path'); // handling file paths
const http = require('http');  // to create an HTTP server
const WebSocket = require('ws'); // WebSocket functionality
const { Worker } = require('worker_threads'); // 'Worker' from 'worker_threads' for multi-threading
const TicketPool = require('./TicketPool');

const server = http.createServer(); // Creating an HTTP server instance
const wss = new WebSocket.Server({ server }); // Creating a WebSocket server using the HTTP server

let ticketPool = null;  
const clients = new Set(); // Creating a set to store connected WebSocket clients
let vendorWorkers = []; // Array to hold vendor vendor worker thread
let customerWorkers = [];
let vendors = []; 
let customers = [];
let isRunning = false; // Flag to indicate if the simulation is running
let vendorsStopped = false;

function createWorkers(config) {
  vendorWorkers.forEach(worker => worker.terminate());
  customerWorkers.forEach(worker => worker.terminate());
  vendorWorkers = [];
  customerWorkers = [];
  vendors = [];
  customers = [];

  for (let i = 0; i < config.vendorCount; i++) {   // Looping to create vendor workers
    const worker = new Worker('./vendorWorker.js');
    const vendorId = i + 1;
    worker.postMessage({ type: 'setId', id: vendorId });
    worker.on('message', handleVendorMessage);   // Setting up a message handler for the worker
    vendorWorkers.push(worker);
    vendors.push({ id: vendorId, ticketsAdded: 0, ticketsSold: 0 });
  }

  for (let i = 0; i < config.customerCount; i++) {  // Looping to create customer workers
    const worker = new Worker('./customerWorker.js');
    const customerId = i + 1;
    worker.postMessage({ type: 'setId', id: customerId });
    worker.on('message', handleCustomerMessage);
    customerWorkers.push(worker);
    customers.push({ id: customerId, ticketsPurchased: 0 });  // Storing customer data
  }
}

function handleVendorMessage(message) {  
  if (message.action === 'addTickets' && ticketPool && isRunning) {  // Checking if the action is to add tickets
    const addedTickets = ticketPool.addTickets(message.count, message.id);
    if (addedTickets > 0) {
      console.log(`Vendor ${message.id} added ${addedTickets} tickets.`);
      const vendor = vendors.find(v => v.id === message.id);
      if (vendor) {
        vendor.ticketsAdded += addedTickets;
      }
      broadcastStatus();  // Broadcasting the current status to all clients
    }
    checkSimulationEnd();  // Checking if the simulation should end
  }
}

function handleCustomerMessage(message) {
  if (message.action === 'removeTicket' && ticketPool && isRunning) {
    const removed = ticketPool.removeTicket(message.id);
    if (removed) {
      console.log(`Customer ${message.id} bought a ticket`);
      const customer = customers.find(c => c.id === message.id);
      if (customer) {
        customer.ticketsPurchased++;
      }
      const vendorsWithTickets = vendors.filter(v => v.ticketsAdded > v.ticketsSold);
      if (vendorsWithTickets.length > 0) {
        const randomVendorIndex = Math.floor(Math.random() * vendorsWithTickets.length);
        const randomVendor = vendorsWithTickets[randomVendorIndex];
        randomVendor.ticketsSold++;
      }
      broadcastStatus();
    }
    checkSimulationEnd();
  }
}

function stopVendors() {
  vendorWorkers.forEach(worker => worker.postMessage({ type: 'stop' }));  // Sending stop message to all vendor workers
}

function stopSimulation() {
  if (!isRunning) return;  // If the simulation is not running, exit the function

  isRunning = false;
  if (!vendorsStopped) {
    stopVendors();
  }
  customerWorkers.forEach(worker => worker.postMessage({ type: 'stop' }));  // Sending stop message to all customer workers
  broadcastStatus();
  console.log('Simulation stopped. All tickets have been sold or added.');
}

function checkSimulationEnd() {
  if (!isRunning) return;

  const allTicketsAdded = ticketPool.totalAdded >= ticketPool.totalTickets;
  const allTicketsSold = ticketPool.totalSold >= ticketPool.totalTickets;

  if (allTicketsAdded && !vendorsStopped) {
    console.log('All tickets have been added. Stopping vendors.');
    stopVendors();
    vendorsStopped = true;
  }

  if (allTicketsSold) {
    console.log('All tickets have been sold. Stopping the simulation.');
    stopSimulation();
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New WebSocket connection established');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'start':


          // Database as JSON file to save the data and append results to the histry.
          const jsonString = JSON.stringify(data.config,null,2);
          const filePath = path.join(__dirname,'database.json');
          fs.readFile(filePath, 'utf8', (err,values) => {
            if(err){
              console.error('Error on witring data to database',err);
              return;
            }
            try{
              const jsonData = JSON.parse(values);
              if(Array.isArray(jsonData)){
                jsonData.push(data.config);
              } else if (typeof jsonData == 'object') {
                jsonData.additionalData = data.config;
              } else {
                console.error('Unsupported Format on JSON');
                return;
              }
              const updatedJsonContent = JSON.stringify(jsonData, null, 2);

              fs.writeFile(filePath,updatedJsonContent,(err) => {
                if(err){
                  console.error('Error on witring data to database',err);
                } else {
                  console.log('Successfully written data to database');
                }
              });

            } catch (parseErr) {
              console.error('Error while Parsing the Json', parseErr);
            }
          });

          console.log('Received start command with config:', data.config);  // Logging the received start command
          ticketPool = new TicketPool(data.config.totalTickets, data.config.maximumTicketCapacity);
          createWorkers(data.config);
          vendorWorkers.forEach(worker => worker.postMessage({ type: 'start', config: data.config }));
          customerWorkers.forEach(worker => worker.postMessage({ type: 'start', config: data.config }));
          isRunning = true;
          vendorsStopped = false;
          broadcastStatus();
          break;
        case 'stop':
          console.log('Received stop command');
          stopSimulation();
          break;
        case 'reset':
          console.log('Received reset command');
          if (ticketPool) {
            ticketPool.reset();
            vendors.forEach(vendor => {
              vendor.ticketsAdded = 0; 
              vendor.ticketsSold = 0; // Resetting tickets sold count
            });
            customers.forEach(customer => {
              customer.ticketsPurchased = 0;  // Resetting tickets purchased count
            });
            broadcastStatus();
          }
          vendorWorkers.forEach(worker => worker.postMessage({ type: 'reset' }));  // Resetting vendor workers
          customerWorkers.forEach(worker => worker.postMessage({ type: 'reset' }));
          isRunning = false;
          vendorsStopped = false;
          break;
        default:
          console.log('Received unknown command:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {  // Handling WebSocket connection closure
    clients.delete(ws);
    console.log('WebSocket connection closed');
  });

  if (ticketPool) { // If the ticket pool exists
    sendStatus(ws);
  }
});

function broadcastStatus() { // Function to broadcast the current status to all clients
  for (const client of clients) {
    sendStatus(client);
  }
}

function sendStatus(ws) { // Function to send the current status to a specific client
  if (ws.readyState === WebSocket.OPEN && ticketPool) {
    const status = ticketPool.getStatus();
    ws.send(JSON.stringify({ // Sending the status to the client
      type: 'status',
      status: status,
      isRunning: isRunning
    }));
    ws.send(JSON.stringify({  // Sending vendor data to the client
      type: 'vendors',
      vendors: vendors
    }));
    ws.send(JSON.stringify({   // Sending customer data to the client
      type: 'customers',
      customers: customers
    }));
  }
}

function scheduleBroadcast() {  // Function to schedule regular status broadcasts
  if (isRunning) {
    broadcastStatus();
    setTimeout(scheduleBroadcast, 1000);
  }
}

scheduleBroadcast();

server.listen(5000, () => {
  console.log('WebSocket server is running on ws://localhost:5000');
});