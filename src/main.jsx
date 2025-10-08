import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Functionality for settings icon and dropdown menu
const settingsIcon = document.createElement('div');
settingsIcon.className = 'settings-icon';
settingsIcon.innerHTML = '⚙️'; // Example icon

const dropdown = document.createElement('div');
dropdown.className = 'dropdown';
dropdown.innerHTML = '<div class="dropdown-item">Toggle Path</div>';

document.body.appendChild(settingsIcon);
document.body.appendChild(dropdown);

settingsIcon.addEventListener('click', () => {
  dropdown.classList.toggle('active');
});

dropdown.addEventListener('click', (event) => {
  if (event.target.classList.contains('dropdown-item')) {
    // Logic to ensure the path updates based on the current mode
function updatePathBasedOnMode(mode) {
  if (mode === 'service') {
    // Logic to show the service path
    console.log('Showing service path');
  } else if (mode === 'base') {
    // Logic to show the base path
    console.log('Showing base path');
  } else {
    // Logic for other modes
    console.log('Showing default path');
  }
}

let pathVisible = false;

function togglePathVisibility() {
  pathVisible = !pathVisible;
  if (pathVisible) {
    // Code to show the path
    console.log('Path is now visible');
  } else {
    // Code to hide the path
    console.log('Path is now hidden');
  }
}

dropdown.addEventListener('click', (event) => {
  if (event.target.classList.contains('dropdown-item')) {
    togglePathVisibility();
  }
});

    console.log('Toggling path visibility');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)