import express from 'express';
import { login, signup } from '../controllers/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

export default router;
