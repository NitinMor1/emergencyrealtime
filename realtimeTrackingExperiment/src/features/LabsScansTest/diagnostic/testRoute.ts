const express = require('express');
const router = express.Router();
const{
    getAllTestOrders,
    getTestOrderById,
    getTestOrdersByPatient,
    getTestOrdersByPhysician,
    getTestOrdersByStatus,
    createTestOrder
}=require('../diagnostic/testControllers');

router.get('/',getAllTestOrders);

router.get('/:id',getTestOrderById);

router.get('/patient/:patientId',getTestOrdersByPatient);

router.get('/physician/:physicianId',getTestOrdersByPhysician);

router.get('/status/:status',getTestOrdersByStatus);

router.post('/',createTestOrder);
module.exports = router;