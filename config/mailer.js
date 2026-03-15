const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

console.log("✅ Mailer ready via Brevo API");

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

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.sender  = {
    name:  "বদর উদ্দিন বেপারী কল্যাণ সংস্থা",
    email: "a50356001@smtp-brevo.com",
  };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.htmlContent = `
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

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendOTPEmail };