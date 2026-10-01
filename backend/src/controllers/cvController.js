import axios from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

// Python AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Forward video to Python AI service for processing
 * Now fully asynchronous - returns immediately with job ID
 */
export const processVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video file uploaded' 
      });
    }

    console.log(`Received video upload: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Create form data
    const formData = new FormData();
    formData.append('video', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward to Python AI service with extended timeout
    // The Python service will accept the file and return immediately with a job ID
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/detect/video`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 600000, // 10 minute timeout for large file uploads
        maxContentLength: 1024 * 1024 * 1024, // 1GB max
        maxBodyLength: 1024 * 1024 * 1024 // 1GB max
      }
    );

    console.log(`Video upload successful, job ID: ${response.data.job_id}`);

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error processing video:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available. Please start the Python AI service.'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Upload timeout. The file may be too large or the connection is slow. Try a smaller video file.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process video'
    });
  }
};

/**
 * Get job status from Python AI service
 */
export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const response = await axios.get(
      `${AI_SERVICE_URL}/api/detect/jobs/${jobId}`,
      { timeout: 5000 }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error getting job status:', error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get job status'
    });
  }
};

/**
 * Proxy video download from Python AI service
 */
export const getJobVideo = async (req, res) => {
  try {
    const { jobId } = req.params;

    const response = await axios.get(
      `${AI_SERVICE_URL}/api/detect/jobs/${jobId}/video`,
      {
        responseType: 'stream',
        timeout: 30000
      }
    );

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${jobId}_tracked.mp4"`);

    response.data.pipe(res);

  } catch (error) {
    console.error('Error getting job video:', error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get video'
    });
  }
};

/**
 * Proxy track data download from Python AI service
 */
export const getJobTracks = async (req, res) => {
  try {
    const { jobId } = req.params;

    const response = await axios.get(
      `${AI_SERVICE_URL}/api/detect/jobs/${jobId}/tracks`,
      { timeout: 10000 }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error getting job tracks:', error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Track data not found'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get track data'
    });
  }
};

/**
 * Check AI service health
 */
export const checkHealth = async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_SERVICE_URL}/health`,
      { timeout: 5000 }
    );

    res.json({
      success: true,
      data: {
        status: 'online',
        ...response.data
      }
    });

  } catch (error) {
    console.error('AI service health check failed:', error);

    res.json({
      success: true,
      data: {
        status: 'offline',
        error: error.message
      }
    });
  }
};
