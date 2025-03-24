import React, { useState } from 'react';
import './configurationForm.css';

const ConfigurationForm = ({ onSubmit }) => {
   // State to hold form data
  const [formData, setFormData] = useState({
    totalTickets: '',
    maximumTicketCapacity: '',
    ticketReleaseRate: '',
    customerRetrievalRate: '',
    customerCount: '',
    vendorCount: ''
  });

   // State to hold validation errors
  const [errors, setErrors] = useState({});
// Function to validate individual fields
  const validateField = (name, value) => {
    //Check if the value is empty, not a number, less than or equal to zero, or not an integer
    if (value === '' || isNaN(value) || Number(value) <= 0 || !Number.isInteger(Number(value))) {
      return 'Please enter a positive integer';
    }
    return '';
  };
// Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };
// Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    let hasErrors = false;

    Object.entries(formData).forEach(([key, value]) => { // Validate all fields in the form
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
  // If no errors, prepare data for submission
    if (!hasErrors) {
      const numericData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, parseInt(value, 10)])  // Convert string values to integers
      );
      onSubmit(numericData);  // Call the onSubmit function with numeric data
    }
  };

  return (
    <div className="configuration-form">
      <h2>Configuration Settings</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Total Tickets:
          <input
            type="number"
            name="totalTickets"
            value={formData.totalTickets}
            onChange={handleChange}
            placeholder="Total tickets"
            required
          />
          {errors.totalTickets && <span className="error">{errors.totalTickets}</span>}
        </label>
        <label>
          Enter Maximum Ticket Capacity:
          <input
            type="number"
            name="maximumTicketCapacity"
            value={formData.maximumTicketCapacity}
            onChange={handleChange}
            placeholder="Maximum ticket capacity"
            required
          />
          {errors.maximumTicketCapacity && <span className="error">{errors.maximumTicketCapacity}</span>}
        </label>
        <label>
          Enter Ticket Release Rate:
          <input
            type="number"
            name="ticketReleaseRate"
            value={formData.ticketReleaseRate}
            onChange={handleChange}
            placeholder="Ticket Release Rate"
            required
          />
          {errors.ticketReleaseRate && <span className="error">{errors.ticketReleaseRate}</span>}
        </label>
        <label>
          Enter Customer Release Rate:
          <input
            type="number"
            name="customerRetrievalRate"
            value={formData.customerRetrievalRate}
            onChange={handleChange}
            placeholder="Customer Release Rate"
            required
          />
          {errors.customerRetrievalRate && <span className="error">{errors.customerRetrievalRate}</span>}
        </label>
        <label>
          Enter Number of Customers:
          <input
            type="number"
            name="customerCount"
            value={formData.customerCount}
            onChange={handleChange}
            placeholder="Number of customers"
            required
          />
          {errors.customerCount && <span className="error">{errors.customerCount}</span>}
        </label>
        <label>
          Enter Number of Vendors:
          <input
            type="number"
            name="vendorCount"
            value={formData.vendorCount}
            onChange={handleChange}
            placeholder="Number of vendors"
            required
          />
          {errors.vendorCount && <span className="error">{errors.vendorCount}</span>}
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ConfigurationForm;

