let durationChart;
let entryChart;

function statusCodeToText(code) {
  if (code === 0) return 'ว่าง';
  if (code === 1) return 'ไม่ว่าง';
  if (code === 2) return 'ซ่อมบำรุง';
  return 'ไม่ทราบ';
}

function statusTextToCode(text) {
  if (text === 'ว่าง') return 0;
  if (text === 'ไม่ว่าง') return 1;
  if (text === 'ซ่อมบำรุง') return 2;
  return -1;
}


function getNextStatus(currentStatus) {
  if (currentStatus === 'ว่าง') return 'ซ่อมบำรุง';
  if (currentStatus === 'ซ่อมบำรุง') return 'ว่าง';
  if (currentStatus === 'ไม่ว่าง') return 'ซ่อมบำรุง';
  return 'ว่าง';
}

// วาดกราฟจำนวนชั่วโมงที่จอดเฉลี่ย
function drawDurationChart(data) {
  const ctx = document.getElementById('parkingDurationChart').getContext('2d');
  if (durationChart) durationChart.destroy();

  durationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'ชั่วโมงที่จอดเฉลี่ย',
        data: Object.values(data).map(arr =>
          arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0
        ),
        backgroundColor: '#00fe48ff'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'ชั่วโมง' }
        }
      }
    }
  });
}

// วาดกราฟเวลาเข้าจอด
function drawEntryTimeChart(entryTimes) {
  const ctx = document.getElementById('parkingEntryChart').getContext('2d');
  if (entryChart) entryChart.destroy();

  const labels = [];
  for (let h = 0; h < 24; h++) {
    labels.push(`${h}:00 - ${h + 1}:00`);
  }

  const datasets = Object.keys(entryTimes).map((slot, i) => {
    const counts = new Array(24).fill(0);
    entryTimes[slot].forEach(date => {
      const hour = new Date(date).getHours();
      counts[hour]++;
    });

    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    return {
      label: `Slot ${slot}`,
      data: counts,
      backgroundColor: colors[i % colors.length],
    };
  });

  entryChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'จำนวนครั้งที่เข้าจอด' }
        },
        x: {
          title: { display: true, text: 'ช่วงเวลาที่เข้าจอด (ชั่วโมง)' }
        }
      }
    }
  });
}

async function loadParkingLogsAndDrawCharts(month = '', year = '') {
  try {
    const res = await fetch(`/api/parking/logs?month=${month}&year=${year}`);
    const logs = await res.json();
    if (!Array.isArray(logs)) throw new Error('Invalid logs');

    const durations = {};
    const entryTimes = {};

    for (const log of logs) {
      const { slot, time_in, time_out } = log;
      const inTime = new Date(time_in);
      const outTime = new Date(time_out);
      const duration = (outTime - inTime) / (1000 * 60 * 60);

      if (!durations[slot]) durations[slot] = [];
      if (!entryTimes[slot]) entryTimes[slot] = [];

      durations[slot].push(duration);
      entryTimes[slot].push(inTime);
    }

    drawDurationChart(durations);
    drawEntryTimeChart(entryTimes);
  } catch (err) {
    console.error('Error loading logs:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn1 = document.getElementById('toggleStatusBtn1');
  const btn2 = document.getElementById('toggleStatusBtn2');
  const status1 = document.getElementById('statusValue1');
  const status2 = document.getElementById('statusValue2');

  const ref1 = { value: 'ไม่ทราบ' };
  const ref2 = { value: 'ไม่ทราบ' };

  function updateButtonText(button, currentStatus) {
    const next = getNextStatus(currentStatus);
    button.textContent = `เปลี่ยนสถานะเป็น ${next}`;
  }

  function applyStatus(slot, statusCodeOrText, button, statusElem, ref) {
    const statusText = typeof statusCodeOrText === 'number'
      ? statusCodeToText(statusCodeOrText)
      : statusCodeOrText;

    ref.value = statusText;
    statusElem.classList.remove('status-vacant', 'status-occupied', 'status-maintenance');
    statusElem.textContent = statusText;

    if (statusText === 'ว่าง') statusElem.classList.add('status-vacant');
    else if (statusText === 'ไม่ว่าง') statusElem.classList.add('status-occupied');
    else if (statusText === 'ซ่อมบำรุง') statusElem.classList.add('status-maintenance');

    updateButtonText(button, statusText);
  }

  async function loadInitialStatus() {
    try {
      const res = await fetch('/api/parking/status');
      const data = await res.json();

      const slot1 = data.find(s => s.slot === 1);
      const slot2 = data.find(s => s.slot === 2);

      if (slot1) applyStatus(1, slot1.status, btn1, status1, ref1);
      if (slot2) applyStatus(2, slot2.status, btn2, status2, ref2);
    } catch (err) {
      console.error('Error loading status:', err);
    }
  }

  function setupToggle(button, statusElem, slot, ref) {
    button.onclick = async () => {
      button.disabled = true;
      const oldStatus = ref.value;
      const newStatus = getNextStatus(oldStatus);

      applyStatus(slot, newStatus, button, statusElem, ref);

      const payload = {
        slot,
        status: statusTextToCode(newStatus)
      };

      try {
        const res = await fetch('/api/admin/controll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('ส่งสถานะไม่สำเร็จ');
      } catch (err) {
        alert(err.message);
        applyStatus(slot, oldStatus, button, statusElem, ref); // กลับสถานะเดิม
      } finally {
        button.disabled = false;
      }
    };
  }

  function createEventSource() {
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        data.forEach(slot => {
          if (slot.slot === 1) applyStatus(1, slot.status, btn1, status1, ref1);
          if (slot.slot === 2) applyStatus(2, slot.status, btn2, status2, ref2);
        });
      } catch (err) {
        console.error('SSE error:', err);
      }
    };
    es.onerror = () => {
      es.close();
      setTimeout(createEventSource, 3000);
    };
  }

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  });

  // Init
  loadInitialStatus();
  setupToggle(btn1, status1, 1, ref1);
  setupToggle(btn2, status2, 2, ref2);
  createEventSource();
  loadParkingLogsAndDrawCharts();

  const yearSelect = document.getElementById('yearSelect');
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  document.getElementById('loadChartBtn').addEventListener('click', () => {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;
    loadParkingLogsAndDrawCharts(month, year);
  });
});
