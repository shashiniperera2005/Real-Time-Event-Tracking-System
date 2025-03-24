
import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './ticketSalesChart.css';

// Registering necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TicketSalesChart = ({ salesData, isRunning }) => {
  const chartRef = useRef(null);  // Creating a reference for the chart instance

  const chartData = {
    labels: salesData.map(data => new Date(data.time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Tickets Sold',  //Label for the dataset
        data: salesData.map(data => data.sales),
        fill: false,
        backgroundColor: 'rgb(53,28,117)',
        borderColor: 'rgb(53,28,117)',
      },
    ],
  };

  const options = {
    responsive: true,  // Making the chart responsive
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  useEffect(() => {
    if (chartRef.current && !isRunning) {
      chartRef.current.stop();
    }
  }, [isRunning]);

  return (
    <div className="ticket-sales-chart">
      <h2>Ticket Sales Over Time</h2> 
      <Line ref={chartRef} data={chartData} options={options} /> 
    </div>
  );
};

export default TicketSalesChart;




