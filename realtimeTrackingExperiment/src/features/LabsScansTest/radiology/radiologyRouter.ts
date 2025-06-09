import express from 'express';
import {
  handleDicomUpload,
  streamToCloudinary,
  handleChunkedUpload,
  streamDicomDownload,
  listDicomFiles,
  deleteDicomFile
} from './radiologyController';

const router = express.Router();

/**
 * @route   POST /api/radiology/dicom/upload
 * @desc    Upload a single DICOM file
 * @access  Private
 */
router.post('/dicom/upload',handleDicomUpload('dicomFile'),streamToCloudinary,(req, res) => {
    const result = req.body.cloudinaryResult;
    return res.status(200).json({
        success: true,
        message: 'DICOM file uploaded successfully',
        result
        });
    }
);

/**
 * @route   POST /api/radiology/dicom/chunk-upload
 * @desc    Upload a DICOM file in chunks
 * @access  Private
 */
router.post('/dicom/chunk-upload', handleChunkedUpload());

/**
 * @route   GET /api/radiology/dicom/list
 * @desc    List all DICOM files for a hospital
 * @access  Private
 */
router.get('/dicom/list', listDicomFiles());

/**
 * @route   GET /api/radiology/dicom/:public_id
 * @desc    Stream download a DICOM file
 * @access  Private
 */
router.get('/dicom/:public_id', streamDicomDownload());

/**
 * @route   DELETE /api/radiology/dicom/:public_id
 * @desc    Delete a DICOM file
 * @access  Private
 */
router.delete('/dicom/:public_id', deleteDicomFile());

export default router;
