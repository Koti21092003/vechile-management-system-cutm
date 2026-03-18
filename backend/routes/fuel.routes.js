import express from 'express';
import { getAllFuelRecords, getFuelRecord, createFuelRecord, updateFuelRecord, deleteFuelRecord } from '../controllers/fuel.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllFuelRecords).post(createFuelRecord);
router.route('/:id').get(getFuelRecord).put(updateFuelRecord).delete(deleteFuelRecord);

export default router;
