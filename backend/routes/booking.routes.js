import express from 'express';
import { 
    getAllBookings, 
    getBooking, 
    createBooking, 
    updateBooking, 
    deleteBooking, 
    approveBooking, 
    declineBooking,
    acceptBooking 
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getAllBookings).post(createBooking);
router.route('/:id').get(getBooking).put(updateBooking).delete(deleteBooking);
router.patch('/:id/approve', authorize('admin'), approveBooking);
router.patch('/:id/decline', authorize('admin'), declineBooking);

// Driver accepts a booking
router.patch('/:id/accept', authorize('driver'), acceptBooking);

export default router;
