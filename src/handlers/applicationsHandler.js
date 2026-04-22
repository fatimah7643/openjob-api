const pool = require('../database/pool');
const generateId = require('../utils/idGenerator');
const redis = require('../utils/redisClient');
const amqp = require('amqplib');

const CACHE_TTL = 3600; 

const publishToQueue = async (applicationId) => {
  const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  const queue = 'application_notifications';

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify({ application_id: applicationId })), {
    persistent: true,
  });

  console.log(`[RabbitMQ] Published application_id: ${applicationId}`);

  setTimeout(() => {
    connection.close();
  }, 500);
};

const addApplication = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    const user_id = req.user.id;
    const id = generateId();

    const job = await pool.query('SELECT * FROM "jobs" WHERE id = $1', [job_id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Job not found' });
    }

    const existing = await pool.query(
      'SELECT * FROM "applications" WHERE user_id = $1 AND job_id = $2',
      [user_id, job_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'failed', message: 'Already applied to this job' });
    }

    const result = await pool.query(
      'INSERT INTO "applications" (id, user_id, job_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, user_id, job_id, 'pending']
    );

    const application = result.rows[0];


    await redis.del(`applications:user:${user_id}`);
    await redis.del(`applications:job:${job_id}`);

    await publishToQueue(id);

    return res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { ...application }, // ⬅️ kembalikan data lengkap
    });
  } catch (err) {
    next(err);
  }
};

const getAllApplications = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.user_id,
        a.job_id,
        a.status,
        a.created_at,
        a.updated_at,
        u.name as user_name,
        u.email as user_email,
        j.title as job_title,
        j.location_city,
        j.job_type,
        j.salary_min,
        j.salary_max
       FROM "applications" a
       LEFT JOIN "users" u ON a.user_id = u.id
       LEFT JOIN "jobs" j ON a.job_id = j.id
       ORDER BY a.created_at DESC`
    );
    return res.status(200).json({ status: 'success', data: { applications: result.rows } });
  } catch (err) {
    next(err);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `application:${id}`;

    // Cek cache dulu
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set('X-Data-Source', 'cache')
        .json({
          status: 'success',
          data: JSON.parse(cached),
        });
    }

    const result = await pool.query(
      `SELECT a.*, u.name as user_name, j.title as job_title
       FROM "applications" a
       LEFT JOIN "users" u ON a.user_id = u.id
       LEFT JOIN "jobs" j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Application not found' });
    }

    const application = result.rows[0];

    // Simpan ke cache 1 jam
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(application));

    return res
      .status(200)
      .set('X-Data-Source', 'database') 
      .json({ status: 'success', data: { ...application } });
  } catch (err) {
    next(err);
  }
};

const getApplicationsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cacheKey = `applications:user:${userId}`;


    const cached = await redis.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set('X-Data-Source', 'cache')
        .json({
          status: 'success',
          data: JSON.parse(cached),
        });
    }

    const result = await pool.query(
      `SELECT a.*, j.title as job_title
       FROM "applications" a
       LEFT JOIN "jobs" j ON a.job_id = j.id
       WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
      [userId]
    );

    const data = { applications: result.rows };


    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

    return res
    .status(200)
    .set('X-Data-Source', 'database')
    .json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const getApplicationsByJobId = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const cacheKey = `applications:job:${jobId}`;


    const cached = await redis.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .set('X-Data-Source', 'cache')
        .json({
          status: 'success',
          data: JSON.parse(cached),
        });
    }

    const result = await pool.query(
      `SELECT a.*, u.name as user_name
       FROM "applications" a
       LEFT JOIN "users" u ON a.user_id = u.id
       WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
      [jobId]
    );

    const data = { applications: result.rows };


    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

    return res
    .status(200)
    .set('X-Data-Source', 'database')
    .json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query('SELECT * FROM "applications" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Application not found' });
    }

    const app = result.rows[0];

    await pool.query(
      'UPDATE "applications" SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );


    await redis.del(`application:${id}`);
    await redis.del(`applications:user:${app.user_id}`);
    await redis.del(`applications:job:${app.job_id}`);

    return res.status(200).json({ status: 'success', message: 'Application status updated' });
  } catch (err) {
    next(err);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "applications" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'failed', message: 'Application not found' });
    }
    await pool.query('DELETE FROM "applications" WHERE id = $1', [id]);
    return res.status(200).json({ status: 'success', message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  updateApplicationStatus,
  deleteApplication,
};