// get result id to show info
const resultDiv = document.getElementById('result');

function renderData(data) {
    resultDiv.innerHTML = '<h1>สถานะช่องจอดรถ</h1>';

    // loop for info
    data.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.textContent = `ช่อง ${slot.slot} : สถานะ - ${slot.status}`;
        resultDiv.appendChild(slotDiv);
    });
}

// load info when frist time
async function loadInitialStatus() {
    try {
        const res = await fetch('/api/parking/status');
        const data = await res.json();
        renderData(data);
    } catch (err) {
        console.error("โหลดสถานะเริ่มต้นล้มเหลว", err);
    }
}

loadInitialStatus();

// lisenting
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    renderData(data);
};

// error
eventSource.onerror = (err) => {
    console.error("SSE error:", err);
};
