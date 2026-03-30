const PDFDocument = require("pdfkit");

const generateCertificatePDF = (res, { studentName, courseName, instructorName, certificateId, issuedAt }) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
  });

  // Stream to response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="certificate-${certificateId}.pdf"`);
  doc.pipe(res);

  const W = doc.page.width;
  const H = doc.page.height;

  // ── Background ──────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill("#0f172a");

  // Gold border outer
  doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke("#f59e0b");
  // Gold border inner
  doc.rect(30, 30, W - 60, H - 60).lineWidth(1).stroke("#fbbf24");

  // Top accent bar
  doc.rect(20, 20, W - 40, 8).fill("#f59e0b");

  // Decorative corner circles
  const corners = [[45, 45], [W - 45, 45], [45, H - 45], [W - 45, H - 45]];
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 15).fill("#f59e0b");
    doc.circle(x, y, 10).fill("#0f172a");
    doc.circle(x, y, 5).fill("#f59e0b");
  });

  // ── Header ──────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#f59e0b").text("🎓  LEARNIFY", 0, 65, {
    align: "center",
    characterSpacing: 4,
  });

  doc.font("Helvetica").fontSize(10).fillColor("#94a3b8").text("ONLINE LEARNING PLATFORM", 0, 85, {
    align: "center",
    characterSpacing: 3,
  });

  // Divider
  doc.moveTo(W / 2 - 120, 105).lineTo(W / 2 + 120, 105).lineWidth(0.5).stroke("#f59e0b");

  // ── Certificate of Completion ────────────────────────────────────
  doc.font("Helvetica").fontSize(13).fillColor("#cbd5e1").text("CERTIFICATE OF COMPLETION", 0, 118, {
    align: "center",
    characterSpacing: 3,
  });

  doc.font("Helvetica").fontSize(11).fillColor("#94a3b8").text("This is to certify that", 0, 150, { align: "center" });

  // ── Student Name ─────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(38).fillColor("#f8fafc").text(studentName, 0, 168, { align: "center" });

  // Underline
  const nameWidth = doc.widthOfString(studentName, { fontSize: 38 });
  const nameX = (W - Math.min(nameWidth, 500)) / 2;
  doc.moveTo(nameX, 215).lineTo(W - nameX, 215).lineWidth(1).stroke("#f59e0b");

  // ── Body Text ────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(11).fillColor("#94a3b8").text("has successfully completed the course", 0, 225, { align: "center" });

  doc.font("Helvetica-Bold").fontSize(22).fillColor("#f59e0b").text(`"${courseName}"`, 60, 245, { align: "center", width: W - 120 });

  doc.font("Helvetica").fontSize(10).fillColor("#94a3b8").text(`with distinction and demonstrated exceptional learning commitment`, 0, 290, { align: "center" });

  // ── Divider ──────────────────────────────────────────────────────
  doc.moveTo(60, 315).lineTo(W - 60, 315).lineWidth(0.5).stroke("#334155");

  // ── Footer Row ───────────────────────────────────────────────────
  const col1X = 80;
  const col2X = W / 2 - 80;
  const col3X = W - 220;
  const rowY = 330;

  // Instructor
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#f8fafc").text(instructorName, col1X, rowY, { width: 180, align: "center" });
  doc.moveTo(col1X, rowY + 18).lineTo(col1X + 180, rowY + 18).lineWidth(0.5).stroke("#475569");
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("INSTRUCTOR", col1X, rowY + 22, { width: 180, align: "center" });

  // Date
  const dateStr = new Date(issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#f8fafc").text(dateStr, col2X, rowY, { width: 180, align: "center" });
  doc.moveTo(col2X, rowY + 18).lineTo(col2X + 180, rowY + 18).lineWidth(0.5).stroke("#475569");
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("DATE OF COMPLETION", col2X, rowY + 22, { width: 180, align: "center" });

  // Certificate ID
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#f59e0b").text(certificateId, col3X, rowY, { width: 140, align: "center" });
  doc.moveTo(col3X, rowY + 18).lineTo(col3X + 140, rowY + 18).lineWidth(0.5).stroke("#475569");
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("CERTIFICATE ID", col3X, rowY + 22, { width: 140, align: "center" });

  // ── Bottom Verification ──────────────────────────────────────────
  doc.font("Helvetica").fontSize(8).fillColor("#475569").text(
    `Verify at: ${process.env.CLIENT_URL || "https://learnify.app"}/verify/${certificateId}`,
    0, H - 52, { align: "center" }
  );

  // Bottom gold bar
  doc.rect(20, H - 28, W - 40, 8).fill("#f59e0b");

  doc.end();
};

module.exports = { generateCertificatePDF };
