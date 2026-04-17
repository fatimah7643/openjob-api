const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');
const fs = require('fs');

// POST /documents — upload document
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    const user_id = req.user.id;
    const id = generateId();
    const { originalname, filename, path } = req.file;

    await pool.query(
      'INSERT INTO "documents" (id, user_id, filename, original_name, path) VALUES ($1, $2, $3, $4, $5)',
      [id, user_id, filename, originalname, path]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: { documentId: id },
    });
  } catch (err) {
    next(err);
  }
};

// GET /documents — get all documents
const getAllDocuments = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "documents" ORDER BY created_at DESC'
    );
    return res.status(200).json({ status: 'success', data: { documents: result.rows } });
  } catch (err) {
    next(err);
  }
};

// GET /documents/:id — get document by id
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "documents" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Document not found' });
    }

    return res.status(200).json({ status: 'success', data: { document: result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

// DELETE /documents/:id
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "documents" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Document not found' });
    }

    // Hapus file fisik dari disk
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

module.exports = { uploadDocument, getAllDocuments, getDocumentById, deleteDocument };