import ParkingService from '../services/parkingService.js';
import { asyncHandler } from '../utils/errorHandler.js';

class SSEController {
  constructor() {
    this.parkingService = new ParkingService();
    this.clients = new Set();
  }

  subscribeParkingStatus = asyncHandler(async (req, res) => {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Add client to clients set
    this.clients.add(res);

    // Send initial data
    try {
      const statuses = await this.parkingService.getAllSlotStatuses();
      res.write(`data: ${JSON.stringify(statuses)}\n\n`);
    } catch (error) {
      console.error('Error sending initial data:', error);
    }

    // Handle client disconnect
    req.on('close', () => {
      this.clients.delete(res);
    });

    // Send keep-alive message every 30 seconds
    const keepAlive = setInterval(() => {
      if (this.clients.has(res)) {
        res.write(': keep-alive\n\n');
      } else {
        clearInterval(keepAlive);
      }
    }, 30000);
  });

  notifyClients = async (data) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error sending message to client:', error);
        this.clients.delete(client);
      }
    });
  };

  getClientCount = () => {
    return this.clients.size;
  };

  disconnectAllClients = () => {
    this.clients.forEach(client => {
      try {
        client.end();
      } catch (error) {
        console.error('Error disconnecting client:', error);
      }
    });
    this.clients.clear();
  };

  // Export notifyClients for use in services
  notifyClients = this.notifyClients.bind(this);
}

// Export the instance and the notifyClients function
const sseControllerInstance = new SSEController();
export default sseControllerInstance;
export const notifyClients = sseControllerInstance.notifyClients;
