
import React from 'react';
import './ticketStatus.css';

const TicketStatus = ({ totalTickets, maxCapacity, availableTickets, totalAdded, totalSold, remainingToAdd }) => (
  <div className="ticket-status">
    <h2>Ticket Status</h2>
    <div className='ticket-info'>
      <div className='info-item'>
        <span>Total Tickets to be Released: </span><strong>{totalTickets}</strong>
      </div>
      <div className='info-item'>
        <span>Maximum Ticket Capacity: </span><strong>{maxCapacity}</strong>
      </div>
      <div className='info-item'>
        <span>Available Tickets in Pool: </span><strong>{availableTickets}</strong>
      </div>
      <div className='info-item'>
        <span>Total Added Tickets: </span><strong>{totalAdded}</strong>
      </div>
      <div className='info-item'>
        <span>Total Sold Tickets: </span><strong>{totalSold}</strong>
      </div>
      <div className='info-item'>
        <span>Remaining Tickets to Add: </span><strong>{remainingToAdd}</strong>
      </div>
    </div>
  </div>
);

export default TicketStatus;



