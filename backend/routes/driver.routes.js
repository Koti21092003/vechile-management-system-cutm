import express from 'express';
import { getAllDrivers, getDriver, createDriver, updateDriver, deleteDriver } from '../controllers/driver.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllDrivers).post(authorize('admin'), createDriver);
router.route('/:id').get(getDriver).put(authorize('admin'), updateDriver).delete(authorize('admin'), deleteDriver);

export default router;
