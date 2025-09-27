let durationChart;
let entryChart;

function statusCodeToText(code) {
  return ['ว่าง', 'ไม่ว่าง', 'ซ่อมบำรุง'][code] ?? 'ไม่ทราบ';
}

function statusTextToCode(text) {
  return { 'ว่าง': 0, 'ไม่ว่าง': 1, 'ซ่อมบำรุง': 2 }[text] ?? -1;
}

function getNextStatus(currentStatus) {
  return currentStatus === 'ว่าง' || currentStatus === 'ไม่ว่าง'
    ? 'ซ่อมบำรุง'
    : 'ว่าง';
}

function drawDurationChart(data) {
  const ctx = document.getElementById('parkingDurationChart').getContext('2d');
  if (durationChart) durationChart.destroy();

  const slotNames = Object.keys(data);
  const avgDurations = slotNames.map(slot => {
    const arr = data[slot];
    return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
  });

  const colors = ['#4CAF50', '#2196F3', '#FE0048', '#FEA500', '#800080'];

  durationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['เฉลี่ยต่อช่องจอด'],
      datasets: slotNames.map((slot, i) => ({
        label: `ช่อง A${slot}`,
        data: [avgDurations[i]],
        backgroundColor: colors[i % colors.length],
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'ชั่วโมง' },
          ticks: {
            stepSize: 0.5,
            suggestedMax: 8
          }
        }
      }
    }
  });
}

function drawEntryTimeChart(data) {
  const ctx = document.getElementById('parkingEntryChart').getContext('2d');
  if (entryChart) entryChart.destroy();

  const hours = Array.from({ length: 24 }, (_, h) => `${h}:00 - ${h + 1}:00`);
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

  entryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: Object.keys(data).map((slot, i) => {
        const counts = new Array(24).fill(0);
        data[slot].forEach(date => counts[new Date(date).getHours()]++);
        return {
          label: `ช่อง A${slot}`,
          data: counts,
          backgroundColor: colors[i % colors.length],
        };
      })
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'จำนวนครั้งที่เข้าจอด' }
        },
        x: {
          title: { display: true, text: 'ช่วงเวลา (ชั่วโมง)' }
        }
      }
    }
  });
}

async function loadParkingLogsAndDrawCharts(month = '', year = '') {
  try {
    const res = await fetch(`/api/parking/logs?month=${month}&year=${year}`);
    const logs = await res.json();
    if (!Array.isArray(logs)) throw new Error('ข้อมูลไม่ถูกต้อง');

    const durations = {};
    const entryTimes = {};

    logs.forEach(({ slot, time_in, time_out }) => {
      const inTime = new Date(time_in);
      const outTime = new Date(time_out);
      const duration = (outTime - inTime) / 3600000;

      if (!durations[slot]) durations[slot] = [];
      if (!entryTimes[slot]) entryTimes[slot] = [];

      durations[slot].push(duration);
      entryTimes[slot].push(inTime);
    });

    drawDurationChart(durations);
    drawEntryTimeChart(entryTimes);
  } catch (err) {
    console.error('โหลดข้อมูลกราฟล้มเหลว:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn1 = document.getElementById('toggleStatusBtn1');
  const btn2 = document.getElementById('toggleStatusBtn2');
  const status1 = document.getElementById('statusValue1');
  const status2 = document.getElementById('statusValue2');
  const ref1 = { value: 'ไม่ทราบ' };
  const ref2 = { value: 'ไม่ทราบ' };

  async function loadInitialStatus() {
    try {
      const res = await fetch('/api/parking/status');
      const slots = await res.json();

      const slot1 = slots.find(s => s.slot === 1);
      const slot2 = slots.find(s => s.slot === 2);

      if (slot1) applyStatus(1, slot1.status, btn1, status1, ref1);
      if (slot2) applyStatus(2, slot2.status, btn2, status2, ref2);
    } catch (err) {
      console.error('โหลดสถานะช่องจอดล้มเหลว:', err);
    }
  }

  function applyStatus(slot, statusCodeOrText, button, statusElem, ref) {
    const text = typeof statusCodeOrText === 'number'
      ? statusCodeToText(statusCodeOrText)
      : statusCodeOrText;

    ref.value = text;
    statusElem.textContent = text;
    statusElem.className = `status-${{
      'ว่าง': 'vacant',
      'ไม่ว่าง': 'occupied',
      'ซ่อมบำรุง': 'maintenance'
    }[text] || ''}`;

    button.textContent = `เปลี่ยนสถานะเป็น ${getNextStatus(text)}`;
  }

  function setupToggle(button, statusElem, slot, ref) {
    button.onclick = async () => {
      const old = ref.value;
      const next = getNextStatus(old);
      button.disabled = true;
      applyStatus(slot, next, button, statusElem, ref);

      try {
        const res = await fetch('/api/admin/controll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slot, status: statusTextToCode(next) })
        });

        if (!res.ok) throw new Error('ไม่สามารถอัปเดตสถานะได้');
      } catch (err) {
        alert(err.message);
        applyStatus(slot, old, button, statusElem, ref);
      } finally {
        button.disabled = false;
      }
    };
  }

  async function loadPowerStats() {
    try {
      const res = await fetch('/api/admin/getdata/power');
      const data = await res.json();

      if (!data) throw new Error('ไม่มีข้อมูลพลังงาน');
      document.getElementById('latestUse').textContent = `${data.latestUse.toFixed(2)} W`;
      document.getElementById('averageUse').textContent = `${data.averageUse.toFixed(2)} W`;
    } catch (err) {
      console.error('โหลดข้อมูลพลังงานล้มเหลว:', err);
    }
  }

  function createEventSource() {
    const es = new EventSource('/api/events');
    es.onmessage = ({ data }) => {
      try {
        const slots = JSON.parse(data);
        slots.forEach(s => {
          if (s.slot === 1) applyStatus(1, s.status, btn1, status1, ref1);
          if (s.slot === 2) applyStatus(2, s.status, btn2, status2, ref2);
        });
      } catch (err) {
        console.error('EventSource error:', err);
      }
    };
    es.onerror = () => {
      es.close();
      setTimeout(createEventSource, 3000);
    };
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } finally {
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  });

  // Year options
  const yearSelect = document.getElementById('yearSelect');
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  document.getElementById('loadChartBtn').addEventListener('click', () => {
    const m = document.getElementById('monthSelect').value;
    const y = document.getElementById('yearSelect').value;
    loadParkingLogsAndDrawCharts(m, y);
  });

  // Init
  loadInitialStatus();
  setupToggle(btn1, status1, 1, ref1);
  setupToggle(btn2, status2, 2, ref2);
  createEventSource();
  loadPowerStats();
  loadParkingLogsAndDrawCharts();
});
