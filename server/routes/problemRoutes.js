const express = require('express');
const router = express.Router();
const { getProblems, addProblem, updateProblem, deleteProblem } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');
const { validateProblem } = require('../middleware/validate');

router.route('/').get(protect, getProblems).post(protect, validateProblem, addProblem);
router.route('/:id').put(protect, updateProblem).delete(protect, deleteProblem);

module.exports = router;