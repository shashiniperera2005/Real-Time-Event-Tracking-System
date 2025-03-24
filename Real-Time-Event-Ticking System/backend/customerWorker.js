// Importing the parentPort from worker_threads module to communicate with the main thread.
const { parentPort } = require('worker_threads');

let customerId;

function customerWork(config) {
  const buyTicketInterval = setInterval(() => {  // Set an interval to attempt to buy a ticket based on the retrieval rate.
    if (Math.random() < config.customerRetrievalRate) {  // Check if a ticket should be bought based on the configured retrieval rate.
      parentPort.postMessage({ action: 'removeTicket', id: customerId });
    }
  }, 1000); // Try to buy one ticket every second

  return () => clearInterval(buyTicketInterval);
}

let stopWork;

parentPort.on('message', (message) => {
  switch (message.type) {
    case 'setId':
      customerId = message.id;
      break;
    case 'start':
      // If a stop function exists, call it to stop any ongoing work before starting new work.
      if (stopWork) stopWork();
      stopWork = customerWork(message.config);
      break;
    case 'stop':
       // Stop the customer work if it is currently running.
      if (stopWork) stopWork();
      break;
    case 'reset':
      // Reset the customer work if it is currently running.
      if (stopWork) stopWork();
      break;
  }
});

