import express from 'express';
import mainController from '../controllers/controller';

const router = express.Router();

// -- Routes -- \\

router.post('/create', mainController.createController);
router.get('/url', mainController.getController);
router.get('/count', mainController.countController);
router.get('/userurls', mainController.userUrlController);

export default router;