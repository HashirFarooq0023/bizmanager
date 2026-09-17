import express from "express";
import { impersonateUser } from "../controllers/impersonateController.js";

const router = express.Router();

// Service-to-service authentication
const serviceAuth = (req, res, next) => {
  const serviceKey = req.headers['x-megatrix-service-key'];
  const expectedKey = process.env.MEGATRIX_SERVICE_SECRET || 'megatrix_core_internal_service_key_2026';
  if (!serviceKey || serviceKey !== expectedKey) {
    return res.status(403).json({ success: false, message: 'Access denied: Invalid service key.' });
  }
  next();
};

router.use(serviceAuth);
router.post('/impersonate', impersonateUser);

export default router;
