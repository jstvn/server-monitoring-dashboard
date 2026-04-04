const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listServers, getServer, createServer, updateServer, deleteServer } = require('../controllers/serverController');

const router = express.Router();

router.use(protect);
router.route('/').get(listServers).post(createServer);
router.route('/:id').get(getServer).put(updateServer).delete(deleteServer);

module.exports = router;
