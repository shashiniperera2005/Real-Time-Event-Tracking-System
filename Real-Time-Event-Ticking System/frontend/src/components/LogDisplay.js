import './logDisplay.css';

const LogDisplay = ({ vendors, customers }) => {
  return (
    <div className="log-display">
      <h2>Activity Log</h2>
      <div className="table-container">
        <h3>Vendor Information</h3>
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Tickets Added</th>
              <th>Tickets Sold</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (  // Mapping through the vendors array to create table rows
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.ticketsAdded}</td>
                <td>{vendor.ticketsSold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-container">
        <h3>Customer Information</h3>
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Tickets Purchased</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.ticketsPurchased}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogDisplay;


