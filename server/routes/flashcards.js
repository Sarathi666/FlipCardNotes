const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');

router.get('/:workspaceId', flashcardController.getByWorkspace);
router.post('/', flashcardController.create);
router.put('/:id', flashcardController.update);
router.delete('/:id', flashcardController.remove);

module.exports = router;
