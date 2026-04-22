const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');
const fs = require('fs');
const path = require('path');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'failed', message: 'File is required' });
    }

    const user_id = req.user.id;
    const id = generateId();
    const originalname = req.file.originalname;
    const filename = req.file.filename;
    const filePath = req.file.path;
    const size = req.file.size;

    await pool.query(
      'INSERT INTO "documents" (id, user_id, filename, original_name, path) VALUES ($1, $2, $3, $4, $5)',
      [id, user_id, filename, originalname, filePath] 
    );

    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: {
        documentId: id,
        filename: filename,
        originalName: originalname, 
        size: size,
      },
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: 'failed', message: 'File too large. Maximum size is 5MB' });
    }
    if (err.message === 'Only PDF files are allowed') {
      return res.status(400).json({ status: 'failed', message: 'Only PDF files are allowed' });
    }
    next(err);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM "documents" ORDER BY created_at DESC');
    return res.status(200).json({ status: 'success', data: { documents: result.rows } });
  } catch (err) {
    next(err);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "documents" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Document not found' });
    }

    const filePath = path.resolve(result.rows[0].path);
    const originalName = result.rows[0].original_name;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'failed', message: 'File not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const serveDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "documents" WHERE id = $1', [id]); 

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Document not found' });
    }

    const filePath = path.resolve(result.rows[0].path);
    const originalName = result.rows[0].original_name; 

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'failed', message: 'File not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "documents" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Document not found' });
    }

    const filePath = result.rows[0].path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM "documents" WHERE id = $1', [id]);

    return res.status(200).json({ status: 'success', message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getAllDocuments, getDocumentById, serveDocument, deleteDocument };