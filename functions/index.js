const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");
require("dotenv").config();

admin.initializeApp();

const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_SECURE = defineSecret("SMTP_SECURE");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const SMTP_FROM = defineSecret("SMTP_FROM");

function smtpTransport() {
  const host = SMTP_HOST.value();
  const port = Number(SMTP_PORT.value());
  const secure = String(SMTP_SECURE.value() || "true").toLowerCase() === "true";
  const user = SMTP_USER.value();
  const pass = SMTP_PASS.value();
  const from = SMTP_FROM.value();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return { transporter, from };
}

exports.sendQueuedMail = onDocumentCreated(
  {
    document: "mail/{docId}",
    secrets: [SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM]
  },
  async (event) => {
  const snap = event.data;
  if (!snap) return;

  const docRef = snap.ref;
  const data = snap.data() || {};

  // Avoid double-sending if a doc somehow gets re-created.
  if (data.delivery && data.delivery.state) return;

  const to = data.to;
  const subject = data.message && data.message.subject;
  const text = data.message && data.message.text;

  if (!to || !subject || !text) {
    await docRef.set(
      { delivery: { state: "error", error: "Missing to/message.subject/message.text" } },
      { merge: true }
    );
    return;
  }

  let transporter;
  let from;
  try {
    const t = smtpTransport();
    transporter = t.transporter;
    from = t.from;
  } catch (e) {
    await docRef.set(
      { delivery: { state: "error", error: String(e && e.message ? e.message : e) } },
      { merge: true }
    );
    return;
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, text });
    await docRef.set(
      {
        delivery: {
          state: "sent",
          messageId: info && info.messageId ? info.messageId : null,
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      { merge: true }
    );
  } catch (e) {
    await docRef.set(
      { delivery: { state: "error", error: String(e && e.message ? e.message : e) } },
      { merge: true }
    );
  }
});
