import express from 'express';
import { HealthController } from '../controllers/healthController.js';

const router = express.Router();
const healthController = new HealthController();

// Basic health check endpoints
router.get('/health', healthController.getHealthCheck.bind(healthController));
router.get('/healthz', healthController.getHealthCheck.bind(healthController));

// Detailed health endpoints
router.get('/health/server', healthController.getServerHealth.bind(healthController));
router.get('/health/database', healthController.getDatabaseHealth.bind(healthController));
router.get('/health/full', healthController.getFullHealthCheck.bind(healthController));

// Kubernetes readiness and liveness probes
router.get('/ready', healthController.getReadinessCheck.bind(healthController));
router.get('/live', healthController.getLivenessCheck.bind(healthController));

export default router;
