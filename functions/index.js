// functions/index.js
const functions = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Инициализация Firebase Admin SDK
admin.initializeApp();

// Секреты для Яндекс почты (задаёшь в Firebase → Build → Functions → Secrets)
const YANDEX_EMAIL = defineSecret("YANDEX_EMAIL");
const YANDEX_PASS = defineSecret("YANDEX_PASS");

// Настройки редиректа после подтверждения
const ACTION_CODE_SETTINGS = {
  url: "https://ticketboom.vercel.app/verified",
  handleCodeInApp: false,
};

exports.sendVerificationEmail = functions.onCall(
  { secrets: [YANDEX_EMAIL, YANDEX_PASS] },
  async (request) => {
    const context = request.auth;
    if (!context || !context.token || !context.token.email) {
      throw new functions.HttpsError(
        "unauthenticated",
        "Нужно быть авторизованным."
      );
    }

    const email = context.token.email;

    try {
      // Генерим ссылку подтверждения
      const link = await admin
        .auth()
        .generateEmailVerificationLink(email, ACTION_CODE_SETTINGS);

      // SMTP для Яндекса
      const transporter = nodemailer.createTransport({
        host: "smtp.yandex.com",
        port: 465,
        secure: true,
        auth: {
          user: YANDEX_EMAIL.value(),
          pass: YANDEX_PASS.value(),
        },
      });

      // Отправка письма
      await transporter.sendMail({
        from: `"TicketBoom" <${YANDEX_EMAIL.value()}>`,
        to: email,
        subject: "Подтверждение e-mail",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
            <h2>Подтвердите e-mail</h2>
            <p>Нажмите кнопку ниже, чтобы подтвердить ваш адрес:</p>
            <p>
              <a href="${link}" 
                 style="display:inline-block;padding:10px 18px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:6px">
                Подтвердить e-mail
              </a>
            </p>
            <p style="color:#666;font-size:12px">
              Если кнопка не работает — скопируйте ссылку в браузер:<br>
              <a href="${link}">${link}</a>
            </p>
          </div>
        `,
      });

      return { ok: true };
    } catch (err) {
      console.error("sendVerificationEmail error:", err);
      throw new functions.HttpsError("internal", err.message);
    }
  }
);
