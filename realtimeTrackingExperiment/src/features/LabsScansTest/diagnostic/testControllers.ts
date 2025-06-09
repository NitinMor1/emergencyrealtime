// controllers/testOrderController.js
const TestOrder = require('../diagnostic/testModel');

exports.getAllTestOrders = async (req: import('express').Request, res: import('express').Response) => {
  try {
    const testOrders = await TestOrder.find().populate('physicianId', 'name');
    res.status(200).json({
      success: true,
      count: testOrders.length,
      data: testOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getTestOrderById = async (req: import('express').Request, res: import('express').Response) => {
  try {
    const testOrder = await TestOrder.findById(req.params.id).populate('physicianId', 'name');
    
    if (!testOrder) {
      return res.status(404).json({
        success: false,
        error: 'Test order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: testOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getTestOrdersByPatient = async (req: import('express').Request, res: import('express').Response) => {
  try {
    const testOrders = await TestOrder.find({ patientId: req.params.patientId }).populate('physicianId', 'name');
    
    if (testOrders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No test orders found for this patient'
      });
    }
    
    res.status(200).json({
      success: true,
      count: testOrders.length,
      data: testOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getTestOrdersByPhysician = async (req: import('express').Request, res: import('express').Response) => {
  try {
    const testOrders = await TestOrder.find({ physicianId: req.params.physicianId });
    
    if (testOrders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No test orders found for this physician'
      });
    }
    
    res.status(200).json({
      success: true,
      count: testOrders.length,
      data: testOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getTestOrdersByStatus = async (req: import('express').Request, res: import('express').Response) => {
  try {
    const testOrders = await TestOrder.find({ orderStatus: req.params.status }).populate('physicianId', 'name');
    
    if (testOrders.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No test orders found with status: ${req.params.status}`
      });
    }
    
    res.status(200).json({
      success: true,
      count: testOrders.length,
      data: testOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.createTestOrder = async (req: import('express').Request, res: import('express').Response) => {
  try {
    const testOrder = await TestOrder.create(req.body);
    
    res.status(201).json({
      success: true,
      data: testOrder
    });
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((val: any) => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};