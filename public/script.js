const path = window.location.pathname;

if (path.endsWith('index.html') || path === '/') {
  initParkingStatusPage();
} else if (path.endsWith('login.html')) {
  initLoginPage();
} else if (path.endsWith('dashboard.html')) {
  initDashboardPage();
}

function initParkingStatusPage() {
  const resultDiv = document.getElementById('result');

  function renderData(data) {
    if (!Array.isArray(data)) {
      resultDiv.innerHTML = '<p>ข้อมูลผิดพลาด</p>';
      return;
    }

    resultDiv.innerHTML = ''; // ล้างข้อมูลเดิม

    const title = document.createElement('h2');
    title.style.textAlign = 'center';
    title.style.fontSize = '2.2rem'; // ตัวอักษรใหญ่ขึ้น
    title.style.marginBottom = '30px';
    resultDiv.appendChild(title);

    // container คล้ายตาราง
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'max-content max-content';
    container.style.width = '100%';  // ให้เต็มพื้นที่ parent
    container.style.maxWidth = '600px';
    container.style.margin = '0 auto';
    container.style.gap = '20px 60px'; // <-- เพิ่มช่องว่างระหว่างคอลัมน์ (จาก 40px เป็น 60px)
    container.style.justifyContent = 'center';
  

    // หัวตารางแบบไม่มีเส้น
    const headerZone = document.createElement('div');
    headerZone.textContent = 'พื้นที่โซน A';
    headerZone.style.fontWeight = '700';
    headerZone.style.fontSize = '1.4rem';
    headerZone.style.textAlign = 'center'; // <-- เปลี่ยนเป็นกึ่งกลาง

    const headerStatus = document.createElement('div');
    headerStatus.textContent = 'สถานะ';
    headerStatus.style.fontWeight = '700';
    headerStatus.style.fontSize = '1.4rem';
    headerStatus.style.textAlign = 'center'; // <-- เปลี่ยนเป็นกึ่งกลาง

    container.appendChild(headerZone);
    container.appendChild(headerStatus);

    data.forEach(slot => {
      const zoneDiv = document.createElement('div');
      zoneDiv.textContent = `A${slot.slot}`;
      zoneDiv.style.fontSize = '1.2rem';
      zoneDiv.style.fontWeight = '600';
      zoneDiv.style.color = '#333';
      zoneDiv.style.textAlign = 'center'; // <-- กึ่งกลางข้อความใน cell

      const statusDiv = document.createElement('div');
      statusDiv.textContent = slot.status;
      statusDiv.style.fontSize = '1.2rem';
      statusDiv.style.fontWeight = '600';
      statusDiv.style.textAlign = 'center'; // <-- กึ่งกลางข้อความใน cell

      // สีสถานะ
      if (slot.status === 'ว่าง') {
        statusDiv.style.color = '#155724';
        statusDiv.style.backgroundColor = '#d4edda';
        statusDiv.style.padding = '6px 12px';
        statusDiv.style.borderRadius = '20px';
        statusDiv.style.display = 'inline-block';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.justifySelf = 'center';  // ให้จัดกึ่งกลางใน grid cell
        // ลบ minWidth หรือไม่กำหนดเลย
      } else if (slot.status === 'จอด') {
        statusDiv.style.color = '#004085';
        statusDiv.style.backgroundColor = '#cce5ff';
        statusDiv.style.padding = '6px 12px';
        statusDiv.style.borderRadius = '20px';
        statusDiv.style.display = 'inline-block';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.justifySelf = 'center';  // ให้จัดกึ่งกลางใน grid cell
      } else if (slot.status === 'ซ่อมบำรุง') {
        statusDiv.style.color = '#721c24';
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.padding = '6px 12px';
        statusDiv.style.borderRadius = '20px';
        statusDiv.style.display = 'inline-block';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.justifySelf = 'center';  // ให้จัดกึ่งกลางใน grid cell
      }


      container.appendChild(zoneDiv);
      container.appendChild(statusDiv);
    });

    resultDiv.appendChild(container);
  }

  async function loadInitialStatus() {
    try {
      const res = await fetch('/api/parking/status');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      renderData(data);
    } catch (err) {
      resultDiv.innerHTML = '<p>โหลดข้อมูลล้มเหลว</p>';
      console.error(err);
    }
  }

  loadInitialStatus();

  // SSE สำหรับรับสถานะใหม่แบบ realtime
  const eventSource = new EventSource('/api/events');

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      renderData(data);
    } catch (err) {
      console.error('แปลงข้อมูล realtime ไม่สำเร็จ', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
  };

  // ปุ่มไปหน้า Login (ถ้ามี)
  const toLoginBtn = document.getElementById('toLoginBtn');
  if (toLoginBtn) {
    toLoginBtn.onclick = () => {
      window.location.href = 'login.html';
    };
  }

  setupLogoutButton();
}

function initLoginPage() {
  const form = document.getElementById('loginForm');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const username = form.username.value;
      const password = form.password.value;

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (res.ok) {
          window.location.href = 'dashboard.html';
        } else {
          alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        console.error(err);
      }
    };
  }

  setupLogoutButton();
}

function initDashboardPage() {
  setupLogoutButton();

  const toggleBtn1 = document.getElementById('toggleStatusBtn1');
  const statusTextElem1 = document.getElementById('carStatusText1');

  const toggleBtn2 = document.getElementById('toggleStatusBtn2');
  const statusTextElem2 = document.getElementById('carStatusText2');

  const carStatusRef1 = { value: 'ไม่ทราบ' };
  const carStatusRef2 = { value: 'ไม่ทราบ' };

  async function loadInitialStatus() {
    try {
      const res = await fetch('/api/parking/status');
      if (!res.ok) throw new Error(`โหลดข้อมูลล้มเหลว: ${res.status}`);

      const data = await res.json();

      const slot1 = data.find(s => s.slot === 1);
      const slot2 = data.find(s => s.slot === 2);

      if (slot1) {
        carStatusRef1.value = slot1.status;
        statusTextElem1.textContent = `สถานะของช่อง 1: ${slot1.status}`;
      } else {
        statusTextElem1.textContent = `สถานะของช่อง 1: ไม่ทราบ`;
      }

      if (slot2) {
        carStatusRef2.value = slot2.status;
        statusTextElem2.textContent = `สถานะของช่อง 2: ${slot2.status}`;
      } else {
        statusTextElem2.textContent = `สถานะของช่อง 2: ไม่ทราบ`;
      }
    } catch (err) {
      statusTextElem1.textContent = "โหลดสถานะไม่สำเร็จ";
      statusTextElem2.textContent = "โหลดสถานะไม่สำเร็จ";
      console.error(err);
    }
  }

  function getOppositeStatus(currentStatus) {
    if (currentStatus === 'ว่าง') return 'ซ่อมบำรุง';
    if (currentStatus === 'ซ่อมบำรุง') return 'ว่าง';
    return 'ว่าง'; // fallback
  }

  function statusTextToCode(statusText) {
    if (statusText === 'ว่าง') return 0;
    if (statusText === 'ซ่อมบำรุง') return 2;
    return -1;
  }

  function setupToggleButton(toggleBtn, statusElem, slotNumber, carStatusRef) {
    toggleBtn.onclick = async () => {
      // ปิดปุ่มระหว่างส่งข้อมูล
      toggleBtn.disabled = true;

      const oldStatus = carStatusRef.value;

      // สลับสถานะในตัวแปรและ UI
      carStatusRef.value = getOppositeStatus(carStatusRef.value);
      statusElem.textContent = `สถานะของช่อง ${slotNumber}: ${carStatusRef.value}`;

      const statusCode = statusTextToCode(carStatusRef.value);

      if (statusCode === -1) {
        alert('สถานะไม่ถูกต้อง ไม่สามารถส่งข้อมูลได้');
        toggleBtn.disabled = false; // เปิดปุ่มคืน
        return;
      }

      const payload = {
        slot: Number(slotNumber),
        status: statusCode
      };

      try {
        const res = await fetch('/api/admin/controll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `ส่งข้อมูลไม่สำเร็จ: ${res.status}`);
        }
      } catch (err) {
        alert(`เกิดข้อผิดพลาด: ${err.message}`);
        // rollback สถานะถ้าส่งไม่สำเร็จ
        carStatusRef.value = oldStatus;
        statusElem.textContent = `สถานะของช่อง ${slotNumber}: ${oldStatus}`;
      } finally {
        // เปิดปุ่มคืนไม่ว่าจะสำเร็จหรือผิดพลาด
        toggleBtn.disabled = false;
      }
    };
  }

  // โหลดสถานะตอนเริ่มต้น
  loadInitialStatus();

  // SSE + reconnect logic
  function createEventSource() {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        data.forEach(slot => {
          if (slot.slot === 1) {
            carStatusRef1.value = slot.status;
            statusTextElem1.textContent = `สถานะของช่อง 1: ${slot.status}`;
          } else if (slot.slot === 2) {
            carStatusRef2.value = slot.status;
            statusTextElem2.textContent = `สถานะของช่อง 2: ${slot.status}`;
          }
        });
      } catch (err) {
        console.error('แปลงข้อมูล SSE ไม่สำเร็จ', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('SSE connection lost, reconnecting in 3 seconds...');
      eventSource.close();
      setTimeout(createEventSource, 3000);
    };

    return eventSource;
  }

  createEventSource();

  // Setup ปุ่ม toggle
  setupToggleButton(toggleBtn1, statusTextElem1, 1, carStatusRef1);
  setupToggleButton(toggleBtn2, statusTextElem2, 2, carStatusRef2);
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      window.location.href = '/index.html';
    };
  }
}

// เรียก setupLogoutButton และ initDashboardPage (ถ้าเป็นหน้า dashboard) เมื่อโหลด DOM เสร็จ
window.addEventListener('DOMContentLoaded', () => {
  setupLogoutButton();

  const path = window.location.pathname;
  if (path.endsWith('dashboard.html') || path === '/dashboard') {
    initDashboardPage();
  }
});
