
const { parentPort } = require('worker_threads');

let vendorId;

function vendorWork(config) {
    // Set an interval to add tickets based on the ticket release rate
    const addTicketInterval = setInterval(() => {
        // Check if a ticket should be added based on the release rate
        if (Math.random() < config.ticketReleaseRate) {
            parentPort.postMessage({ action: 'addTickets', count: 1, id: vendorId });  // Send a message to the parent thread to add a ticket
        }
    }, 1000); // Try to add one ticket every second
    
    // Return a function to clear the interval when needed
    return () => clearInterval(addTicketInterval);
}

let stopWork;

parentPort.on('message', (message) => {
    switch (message.type) {
        case 'setId':
            vendorId = message.id;
            break;
        case 'start':
            if (stopWork) stopWork();
            stopWork = vendorWork(message.config);
            break;
        case 'stop':
            if (stopWork) stopWork();
            break;
        case 'reset':
            if (stopWork) stopWork();
            break;
    }
});

