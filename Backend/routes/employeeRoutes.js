const express = require('express');
const router = express.Router();

const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAll);
router.get('/monthly/:userId/:month', employeeController.getMonthlyReport);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/', employeeController.update); // ← ต้องมี id
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

module.exports = router;