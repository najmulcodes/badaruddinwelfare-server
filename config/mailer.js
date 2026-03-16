const https = require("https");

const sendOTPEmail = async (email, otp, type) => {
  const subject = type === "register"
    ? "ইমেইল যাচাই - বদর উদ্দিন বেপারী কল্যাণ সংস্থা"
    : "পাসওয়ার্ড রিসেট OTP - বদর উদ্দিন বেপারী কল্যাণ সংস্থা";

  const bodyTitle = type === "register"
    ? "নিবন্ধন যাচাই কোড"
    : "পাসওয়ার্ড রিসেট কোড";

  const bodyText = type === "register"
    ? "আপনার নিবন্ধন সম্পন্ন করতে নিচের OTP কোডটি ব্যবহার করুন।"
    : "আপনার পাসওয়ার্ড রিসেট করতে নিচের OTP কোডটি ব্যবহার করুন।";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #065f46, #10b981); padding: 24px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 20px;">${bodyTitle}</h2>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #374151; font-size: 15px; margin-bottom: 24px;">${bodyText}</p>
        <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; display: inline-block;">
          <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #065f46;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 20px;">এই কোডটি <strong>৫ মিনিট</strong> পর্যন্ত বৈধ।</p>
        <p style="color: #ef4444; font-size: 12px;">কোডটি কারো সাথে শেয়ার করবেন না।</p>
      </div>
      <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">বদর উদ্দিন বেপারী কল্যাণ সংস্থা</p>
      </div>
    </div>
  `;

  const payload = JSON.stringify({
    sender: {
      name:  "বদর উদ্দিন বেপারী কল্যাণ সংস্থা",
      email: "badaruddinwelfareorg@gmail.com",
    },
    to: [{ email }],
    subject,
    htmlContent,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.brevo.com",
      path:     "/v3/smtp/email",
      method:   "POST",
      headers: {
        "Content-Type":  "application/json",
        "api-key":       process.env.BREVO_API_KEY,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ OTP email sent to ${email}`);
          resolve();
        } else {
          console.error("❌ Brevo API error:", data);
          reject(new Error(`Brevo API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      console.error("❌ Mailer request error:", err.message);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

console.log("✅ Mailer ready via Brevo HTTP API");

module.exports = { sendOTPEmail };