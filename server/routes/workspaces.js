const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const authenticateToken = require('../middleware/authMiddleware');

// All workspace routes require authentication
router.use(authenticateToken);

router.get('/', workspaceController.getAll);
router.get('/:id/pdf', workspaceController.getPdf);
router.post('/', workspaceController.create);
router.put('/:id', workspaceController.update);
router.delete('/:id', workspaceController.remove);

module.exports = router;
