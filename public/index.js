document.addEventListener('DOMContentLoaded', () => {
  const resultDiv = document.getElementById('result');

  // Render parking slot data into a 2-column grid
  function renderData(data) {
    if (!Array.isArray(data)) {
      resultDiv.innerHTML = '<p>Invalid data</p>';
      return;
    }

    resultDiv.innerHTML = '';

    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr 1fr';
    container.style.maxWidth = '600px';
    container.style.margin = '0 auto';
    container.style.gap = '20px 80px';

    // Create headers for zone and status columns
    const headerZone = document.createElement('div');
    headerZone.textContent = 'พื้นที่โซน A';
    headerZone.style.fontWeight = '700';
    headerZone.style.fontSize = '2rem';
    headerZone.style.textAlign = 'center';

    const headerStatus = document.createElement('div');
    headerStatus.textContent = 'Status';
    headerStatus.style.fontWeight = '700';
    headerStatus.style.fontSize = '2rem';
    headerStatus.style.textAlign = 'center';

    container.appendChild(headerZone);
    container.appendChild(headerStatus);

    // Create grid items for each parking slot
    data.forEach(slot => {
      const zoneDiv = document.createElement('div');
      zoneDiv.textContent = `A${slot.slot}`;
      zoneDiv.classList.add('zone');

      const statusDiv = document.createElement('div');
      statusDiv.textContent = slot.status;
      statusDiv.classList.add('status');

      // Add status color classes based on status text
      if (slot.status === 'ว่าง') {
        statusDiv.classList.add('status-vacant');
      } else if (slot.status === 'ไม่ว่าง') {
        statusDiv.classList.add('status-occupied');
      } else if (slot.status === 'ซ่อมบำรุง') {
        statusDiv.classList.add('status-maintenance');
      }

      container.appendChild(zoneDiv);
      container.appendChild(statusDiv);
    });

    resultDiv.appendChild(container);
  }

  // Fetch initial data and render
  async function loadInitialStatus() {
    try {
      const res = await fetch('/api/parking/status');
      const data = await res.json();
      renderData(data);
    } catch (err) {
      resultDiv.innerHTML = '<p>Failed to load data</p>';
      console.error(err);
    }
  }

  loadInitialStatus();

  // Listen for server-sent events to update data in real-time
  const eventSource = new EventSource('/api/events');
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      renderData(data);
    } catch (err) {
      console.error('SSE error', err);
    }
  };

  // Button to navigate to login page
  const toLoginBtn = document.getElementById('toLoginBtn');
  if (toLoginBtn) {
    toLoginBtn.onclick = () => {
      window.location.href = 'login.html';
    };
  }
});