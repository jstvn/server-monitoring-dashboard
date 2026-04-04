const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listServers, getServer, createServer, updateServer } = require('../controllers/serverController');

const router = express.Router();

router.use(protect);
router.route('/').get(listServers).post(createServer);
router.route('/:id').get(getServer).put(updateServer);

module.exports = router;

