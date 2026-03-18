import express from 'express';
import { getAllTrips, getTrip, createTrip, updateTrip, deleteTrip, startTrip, completeTrip } from '../controllers/trip.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllTrips).post(createTrip);
router.route('/:id').get(getTrip).put(updateTrip).delete(deleteTrip);
router.patch('/:id/start', authorize('driver', 'admin'), startTrip);
router.patch('/:id/complete', authorize('driver', 'admin'), completeTrip);

export default router;
