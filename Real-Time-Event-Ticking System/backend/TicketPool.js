class TicketPool {
  constructor(totalTickets, maxCapacity) {
    this.totalTickets = totalTickets;
    this.maxCapacity = maxCapacity;
    this.availableTickets = 0;
    this.totalAdded = 0;
    this.totalSold = 0;
  }

  addTickets(count, vendorId) {
    const spaceInPool = this.maxCapacity - this.availableTickets; // Calculate available space in the pool
    const remainingToAdd = this.totalTickets - this.totalAdded;  // remaining tickets that can be added
    const addedTickets = Math.min(count, spaceInPool, remainingToAdd);  // Determine the number of tickets to add
    
    this.availableTickets += addedTickets;
    this.totalAdded += addedTickets;

    return addedTickets;
  }

  removeTicket(customerId) {
    if (this.availableTickets > 0) {  // Check if there are available tickets to sell
      this.availableTickets--;
      this.totalSold++;

      return true;
    }
    return false; // Return false indicating no tickets were available to sell
  }

  getStatus() {
    return {
      totalTickets: this.totalTickets, // Return total tickets
      maxCapacity: this.maxCapacity,
      availableTickets: this.availableTickets,
      totalAdded: this.totalAdded,
      totalSold: this.totalSold,
      remainingToAdd: this.totalTickets - this.totalAdded,
    };
  }

  reset() {
    this.availableTickets = 0;  // Reset available tickets to zero
    this.totalAdded = 0;
    this.totalSold = 0;
  }
}

module.exports = TicketPool;

