    /**
     * This file contains utility functions for the client to upload and download DICOM files
     * Can be used as reference for frontend implementation
     */

    /**
     * Upload a DICOM file in chunks to the server
     * @param file The DICOM file to upload
     * @param hospitalId The ID of the hospital
     * @param patientId The ID of the patient
     * @param onProgress Callback for upload progress updates
     * @returns Promise that resolves when the upload is complete
     */
    export async function uploadDicomInChunks(
    file: File,
    hospitalId: string,
    patientId: string,
    onProgress?: (progress: number) => void
    ): Promise<any> {
    // Generate a unique ID for this file
    const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Calculate the total number of chunks
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    try {
        // Upload each chunk
        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        // Calculate chunk boundaries
        const start = chunkNumber * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        // Create form data for this chunk
        const formData = new FormData();
        formData.append('chunk', chunk);
        // Upload this chunk
        const response = await fetch(`/api/radiology/dicom/chunk-upload?hospitalId=${hospitalId}&patientId=${patientId}`, {
            method: 'POST',
            headers: {
            'X-File-Identifier': fileId,
            'X-Chunk-Number': chunkNumber.toString(),
            'X-Total-Chunks': totalChunks.toString(),
            },
            body: chunk, // Send the raw chunk
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to upload chunk ${chunkNumber}: ${errorData.message}`);
        }
        
        // Update progress
        if (onProgress) {
            const progress = Math.round(((chunkNumber + 1) / totalChunks) * 100);
            onProgress(progress);
        }
        
        // If this was the last chunk, get the final result
        if (chunkNumber === totalChunks - 1) {
            const finalResult = await response.json();
            return finalResult;
        }
        }
    } catch (error) {
        console.error('Error during chunked upload:', error);
        throw error;
    }
    }

    /**
     * Download a DICOM file from the server
     * @param publicId The public_id of the file in Cloudinary
     * @returns Promise that resolves when the download is complete
     */
    export async function downloadDicomFile(publicId: string): Promise<void> {
    // Open the file in a new tab or prompt download
    window.open(`/api/radiology/dicom/${encodeURIComponent(publicId)}`, '_blank');
    }

    /**
     * List all DICOM files for a hospital
     * @param hospitalId The ID of the hospital
     * @param patientId Optional patient ID filter
     * @returns Promise that resolves with the list of files
     */
    export async function listDicomFiles(
    hospitalId: string,
    patientId?: string
    ): Promise<any> {
    try {
        let url = `/api/radiology/dicom/list?hospitalId=${encodeURIComponent(hospitalId)}`;
        if (patientId) {
        url += `&patientId=${encodeURIComponent(patientId)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error('Failed to fetch DICOM files');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error listing DICOM files:', error);
        throw error;
    }
    }

    /**
     * Delete a DICOM file
     * @param publicId The public_id of the file in Cloudinary
     * @returns Promise that resolves when the delete is complete
     */
    export async function deleteDicomFile(publicId: string): Promise<any> {
    try {
        const response = await fetch(`/api/radiology/dicom/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        });
        
        if (!response.ok) {
        throw new Error('Failed to delete DICOM file');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error deleting DICOM file:', error);
        throw error;
    }
    }
