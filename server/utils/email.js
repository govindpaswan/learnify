const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Learnify" <noreply@learnify.com>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email error:", err.message);
    throw err;
  }
};

// ── Email Templates ────────────────────────────────────────────────

const enrollmentEmailTemplate = (studentName, courseName, courseId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .body { padding: 40px; }
    .body h2 { color: #1e293b; }
    .body p { color: #475569; line-height: 1.6; }
    .btn { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Learnify</h1>
    </div>
    <div class="body">
      <h2>Welcome to the course, ${studentName}! 🚀</h2>
      <p>You've successfully enrolled in <strong>${courseName}</strong>. Your learning journey starts now!</p>
      <p>Head to your dashboard to begin watching your lessons and tracking your progress.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/my-courses" class="btn">Start Learning →</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Learnify. All rights reserved.</div>
  </div>
</body>
</html>`;

const certificateEmailTemplate = (studentName, courseName, certificateId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b, #f97316); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .body { padding: 40px; }
    .cert-id { background: #fef3c7; border: 2px dashed #f59e0b; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: bold; color: #92400e; letter-spacing: 2px; }
    .btn { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Congratulations!</h1>
    </div>
    <div class="body">
      <h2>You've completed ${courseName}! 🎉</h2>
      <p>Dear <strong>${studentName}</strong>, you've successfully completed all lessons and earned your certificate.</p>
      <div class="cert-id">${certificateId}</div>
      <p>Download your certificate and share it with your network!</p>
      <a href="${process.env.CLIENT_URL}/certificate/${certificateId}" class="btn">View Certificate →</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Learnify. All rights reserved.</div>
  </div>
</body>
</html>`;

module.exports = { sendEmail, enrollmentEmailTemplate, certificateEmailTemplate };
