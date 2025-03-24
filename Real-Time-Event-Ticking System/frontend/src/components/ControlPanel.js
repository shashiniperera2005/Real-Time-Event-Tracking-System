
import React from 'react';  // Importing React library to create components
import './controlpanel.css';  

const ControlPanel = ({ onStart, onStop, onReset, isRunning }) => {
  return (
    <div className="controlpanel">
      <h2>Control Panel</h2>
      <p>Status: <strong>{isRunning ? 'Running' : 'Stop'}</strong></p>  
      <div className="button-grp">
        <button onClick={onStart} disabled={isRunning} className='start-button'>Start</button>  
        <button onClick={onStop} disabled={!isRunning} className='stop-button'>Stop</button>
        <button onClick={onReset} className='reset-button'>Reset</button>
      </div>
    </div>
  );
};

export default ControlPanel;


