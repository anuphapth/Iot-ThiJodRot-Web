const resultDiv = document.getElementById('result');

function renderData(data) {
    resultDiv.innerHTML = '<h1>สถานะช่องจอดรถ</h1>';

    if (!Array.isArray(data)) {
        console.error('ข้อมูลไม่ใช่ Array:', data);
        resultDiv.innerHTML += '<p>ข้อมูลผิดพลาด</p>';
        return;
    }

    data.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.textContent = `ช่อง ${slot.slot} : สถานะ - ${slot.status}`;
        resultDiv.appendChild(slotDiv);
    });
}

async function loadInitialStatus() {
    try {
        const res = await fetch('/api/parking/status');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log('ข้อมูลสถานะ:', data);
        renderData(data);
    } catch (err) {
        console.error("โหลดสถานะเริ่มต้นล้มเหลว", err);
        resultDiv.innerHTML = '<p>โหลดข้อมูลล้มเหลว</p>';
    }
}

loadInitialStatus();

// SSE สำหรับรับสถานะใหม่แบบ realtime
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log('ข้อมูลสถานะ realtime:', data);
        renderData(data);
    } catch (err) {
        console.error('แปลงข้อมูล realtime ไม่สำเร็จ', err);
    }
};

eventSource.onerror = (err) => {
    console.error("SSE error:", err);
};
