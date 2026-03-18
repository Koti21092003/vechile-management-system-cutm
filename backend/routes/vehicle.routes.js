import express from 'express';
import { getAllVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, assignDriver } from '../controllers/vehicle.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllVehicles).post(authorize('admin'), createVehicle);
router.route('/:id').get(getVehicle).put(authorize('admin'), updateVehicle).delete(authorize('admin'), deleteVehicle);
router.patch('/:id/assign-driver', authorize('admin'), assignDriver);

export default router;
