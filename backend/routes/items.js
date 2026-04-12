const express = require('express');
const router  = express.Router();
const {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemsController');
const { verifyToken } = require('../middleware/auth');

// All item routes require authentication
router.use(verifyToken);

router.post('/',    createItem);
router.get('/',     getItems);
router.get('/:id',  getItem);
router.put('/:id',  updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
