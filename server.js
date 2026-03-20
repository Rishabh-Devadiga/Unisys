const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = 3001;

// Initialize Resend with API key
const resend = new Resend('re_Y7XHUk6X_PbL4SyCSVGbkeg4cbs2sdfdC');

// Middleware
app.use(cors());
app.use(express.json());

// Hardcoded defaulters for testing
const defaulters = [
  { name: "Rishabh Devadiga", email: "devadigarishabh@gmail.com", attendance: 60 },
  { name: "Gaurav Pawar", email: "gauravpawar2618@gmail.com", attendance: 65 },
  { name: "Aisha Khan", email: "test1@mock.edu", attendance: 55 },
  { name: "Priya Sharma", email: "test2@mock.edu", attendance: 70 },
  { name: "Vikram Singh", email: "test3@mock.edu", attendance: 52 },
  { name: "Neha Patel", email: "test4@mock.edu", attendance: 68 }
];

// POST endpoint to send emails
app.post('/send-emails', async (req, res) => {
  console.log('===== EMAIL ENDPOINT CALLED =====');
  console.log('Timestamp:', new Date().toISOString());
  try {
    const MIN_ATTENDANCE = 75;
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    console.log('Starting email sending process...');
    console.log('Defaulters to process:', defaulters);

    // Loop through all defaulters and send email individually
    for (const defaulter of defaulters) {
      try {
        // Only send if attendance is below minimum
        if (defaulter.attendance < MIN_ATTENDANCE) {
          console.log(`\n>>> Processing ${defaulter.name} (${defaulter.email}) - Attendance: ${defaulter.attendance}%`);
          
          const htmlContent = `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Low Attendance Warning</h2>
                <p>Dear <strong>${defaulter.name}</strong>,</p>
                <p>This is to inform you that your current attendance is <strong>${defaulter.attendance}%</strong>.</p>
                <p>The minimum required attendance is <strong>${MIN_ATTENDANCE}%</strong>.</p>
                <p>Please take necessary action to improve your attendance.</p>
                <p>If you have any questions, please contact your instructor.</p>
                <br/>
                <p>Best regards,<br/>Administration</p>
              </body>
            </html>
          `;

          // Send email using Resend
          console.log('Calling Resend API with:');
          console.log('- From: onboarding@resend.dev');
          console.log('- To:', defaulter.email);
          console.log('- Subject: Low Attendance Warning');
          
          const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: defaulter.email,
            subject: 'Low Attendance Warning',
            html: htmlContent
          });

          console.log('Resend API Response:', JSON.stringify(response, null, 2));

          results.push({
            student: defaulter.name,
            email: defaulter.email,
            status: 'sent',
            messageId: response.id || response.data?.id,
            apiResponse: response
          });
          successCount++;
          console.log(`✓ Email queued for ${defaulter.name}`);
        }
      } catch (error) {
        console.error(`✗ Error sending email to ${defaulter.name}:`, error);
        results.push({
          student: defaulter.name,
          email: defaulter.email,
          status: 'failed',
          error: error.message
        });
        failureCount++;
      }
    }

    console.log('\n===== SUMMARY =====');
    console.log('Success:', successCount);
    console.log('Failed:', failureCount);
    console.log('Total:', defaulters.length);

    // Return JSON response
    const response = {
      success: failureCount === 0,
      message: `Emails sent to ${successCount} students, ${failureCount} failed`,
      totalStudents: defaulters.length,
      successCount,
      failureCount,
      results
    };

    console.log('Response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Error in /send-emails endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running on port 3001' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Use /send-emails endpoint to send emails to defaulters');
});
