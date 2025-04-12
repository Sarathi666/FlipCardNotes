const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

router.get('/', workspaceController.getAll);
router.post('/', workspaceController.create);
router.put('/:id', workspaceController.update);
router.delete('/:id', workspaceController.remove);

module.exports = router;
