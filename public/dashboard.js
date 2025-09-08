document.addEventListener('DOMContentLoaded', () => {
  // Get buttons and status elements for slots 1 and 2
  const btn1 = document.getElementById('toggleStatusBtn1');
  const btn2 = document.getElementById('toggleStatusBtn2');
  const status1 = document.getElementById('statusValue1');
  const status2 = document.getElementById('statusValue2');

  // Store current status for each slot
  const ref1 = { value: 'ไม่ทราบ' };
  const ref2 = { value: 'ไม่ทราบ' };

  // Get next status in cycle based on current status
  function getNextStatus(status) {
    if (status === 'ว่าง') return 'ซ่อมบำรุง';
    if (status === 'ไม่ว่าง') return 'ซ่อมบำรุง';
    if (status === 'ซ่อมบำรุง') return 'ว่าง';
    return 'ว่าง';
  }

  // Convert status text to numeric code for API
  function statusTextToCode(status) {
    if (status === 'ว่าง') return 0;
    if (status === 'ไม่ว่าง') return 1;
    if (status === 'ซ่อมบำรุง') return 2;
    return -1;
  }

  // Update button label to show next status on click
  function updateButtonText(button, status) {
    const next = getNextStatus(status);
    button.textContent = `เปลี่ยนสถานะเป็น ${next}`;
  }

  // Apply status text, style, and button update
  function applyStatus(slot, status, btn, statusElem, ref) {
    ref.value = status;

    // Remove old status classes
    statusElem.classList.remove('status-vacant', 'status-occupied', 'status-maintenance');

    // Update status text
    statusElem.textContent = status;

    // Add class based on status
    if (status === 'ว่าง') {
      statusElem.classList.add('status-vacant');
    } else if (status === 'ไม่ว่าง') {
      statusElem.classList.add('status-occupied');
    } else if (status === 'ซ่อมบำรุง') {
      statusElem.classList.add('status-maintenance');
    }

    // Update button text
    updateButtonText(btn, status);
  }

  // Load initial statuses from server API
  async function loadInitialStatus() {
    try {
      const res = await fetch('/api/parking/status');
      const data = await res.json();

      const slot1 = data.find(s => s.slot === 1);
      const slot2 = data.find(s => s.slot === 2);

      if (slot1) applyStatus(1, slot1.status, btn1, status1, ref1);
      if (slot2) applyStatus(2, slot2.status, btn2, status2, ref2);

    } catch (err) {
      console.error(err);
    }
  }

  // Setup click event for toggle button to update status
  function setupToggle(btn, statusElem, slot, ref) {
    btn.onclick = async () => {
      btn.disabled = true;

      const oldStatus = ref.value;
      const newStatus = getNextStatus(oldStatus);

      applyStatus(slot, newStatus, btn, statusElem, ref);

      const payload = {
        slot: slot,
        status: statusTextToCode(newStatus)
      };

      try {
        const res = await fetch('/api/admin/controll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('Failed to send data');
        }
      } catch (err) {
        alert(err.message);
        // Revert status on error
        applyStatus(slot, oldStatus, btn, statusElem, ref);
      } finally {
        btn.disabled = false;
      }
    };
  }

  // Setup Server-Sent Events to receive real-time updates
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
        console.error('SSE error', err);
      }
    };
    es.onerror = () => {
      es.close();
      setTimeout(createEventSource, 3000); // Retry connection after 3 seconds
    };
  }
  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', async () => {
    try {
      // (Optional) เรียก API เพื่อ logout ฝั่งเซิร์ฟเวอร์
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // ส่ง cookie ด้วย ถ้าใช้
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // เคลียร์ session ฝั่ง client (ถ้ามี)
      localStorage.removeItem('token'); // ถ้าใช้ localStorage
      sessionStorage.clear(); // หรือใช้ sessionStorage

      // เปลี่ยนไปหน้า login
      window.location.href = 'index.html';
    }
  });


  // Initialize app
  loadInitialStatus();
  setupToggle(btn1, status1, 1, ref1);
  setupToggle(btn2, status2, 2, ref2);
  createEventSource();
});