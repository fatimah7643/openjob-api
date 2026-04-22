require('dotenv').config();
const amqp = require('amqplib');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const pool = new Pool();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const processMessage = async (applicationId) => {
  const result = await pool.query(
    `SELECT 
      a.id as application_id,
      a.created_at as applied_at,
      u.name as applicant_name,
      u.email as applicant_email,
      j.title as job_title,
      owner.email as owner_email
     FROM "applications" a
     JOIN "users" u ON a.user_id = u.id
     JOIN "jobs" j ON a.job_id = j.id
     JOIN "companies" c ON j.company_id = c.id
     JOIN "users" owner ON c.user_id = owner.id
     WHERE a.id = $1`,
    [applicationId]
  );

  if (result.rows.length === 0) {
    console.log(`[Consumer] Application ${applicationId} not found`);
    return;
  }

  const { applicant_name, applicant_email, applied_at, job_title, owner_email } = result.rows[0];

  // Kirim email ke job owner
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: owner_email,
    subject: `New Application for "${job_title}"`,
    html: `
      <h2>Ada pelamar baru!</h2>
      <p><strong>Posisi:</strong> ${job_title}</p>
      <p><strong>Nama Pelamar:</strong> ${applicant_name}</p>
      <p><strong>Email Pelamar:</strong> ${applicant_email}</p>
      <p><strong>Tanggal Melamar:</strong> ${new Date(applied_at).toLocaleString('id-ID')}</p>
    `,
  });

  console.log(`[Consumer] Email terkirim ke ${owner_email} untuk aplikasi ${applicationId}`);
};

const startConsumer = async () => {
  const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  const queue = 'application_notifications';

  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1);

  console.log('[Consumer] Menunggu pesan dari RabbitMQ...');

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { application_id } = JSON.parse(msg.content.toString());
      console.log(`[Consumer] Memproses application_id: ${application_id}`);

      try {
        await processMessage(application_id);
        channel.ack(msg);
      } catch (err) {
        console.error('[Consumer] Error:', err.message);
        channel.nack(msg, false, false);
      }
    }
  });
};

startConsumer().catch(console.error);