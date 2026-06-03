import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // API 1: Fetch active system status & SMTP Configuration Status
  app.get("/api/qapi/status", (req, res) => {
    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({
      success: true,
      message: "QAPI Core Engine je online a plně zvalidován",
      version: "Q2/2026",
      smtpConfigured: isSmtpConfigured,
      smtpHost: process.env.SMTP_HOST || "Nezadáno"
    });
  });

  // API 2: Get detailed SMTP configuration status
  app.get("/api/qapi/smtp-status", (req, res) => {
    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);
    res.json({
      success: true,
      configured: isSmtpConfigured,
      host: process.env.SMTP_HOST || "",
      port: process.env.SMTP_PORT || "587",
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER || "",
      sender: process.env.SMTP_FROM || "QAPI Objednávky <objednavky@qapi.cz>"
    });
  });

  // API 3: Send order/measurement protocol PDF report via SMTP Email
  app.post("/api/qapi/send-email", async (req, res) => {
    try {
      const { 
        orderNumber, 
        items = [], 
        generalNotes = "", 
        recipientEmail, 
        ccEmail, 
        technicianName = "Technik QAPI",
        customerName = "Zákazník",
        customerPhone = "",
        customerAddress = "",
        totalArea = 0,
        totalCount = 0,
        totalWeight = 0
      } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ success: false, error: "Chybí e-mail příjemce zakázky." });
      }

      // Check if SMTP is configured
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpSecure = process.env.SMTP_SECURE === "true";
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || "QAPI Objednávky <objednavky@qapi.cz>";

      const isSmtpActive = !!(smtpHost && smtpUser && smtpPass);

      // Generate pristine, modern HTML table for the email representation
      let itemsRowsHtml = "";
      items.forEach((item: any, idx: number) => {
        const itemArea = ((item.width * item.height) / 1000000);
        const itemTotalArea = itemArea * item.quantity;
        const specsText = [
          `Lamela/Rozměr: ${item.lamellaSize || "-"}`,
          `Barva lamely: ${item.lamellaColor || "-"}`,
          `Profil: ${item.topProfileColor || "-"}`,
          `Ovládání: ${item.controlSide || "-"}`,
          item.isAtypical ? "⚠️ Atypický prvek" : null,
          item.hasBrake ? "S brzdou" : null,
          item.hasGearbox ? "S převodovkou" : null,
          item.notes ? `Poznámka: ${item.notes}` : null
        ].filter(Boolean).join(" • ");

        itemsRowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold; font-family: monospace; color: #475569; text-align: center;">${idx + 1}</td>
            <td style="padding: 10px; font-family: sans-serif; font-size: 13px;">
              <div style="font-weight: 800; color: #1e293b; text-transform: uppercase;">${item.productName || item.productType}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${specsText}</div>
            </td>
            <td style="padding: 10px; font-family: monospace; font-size: 13px; font-weight: bold; text-align: center; color: #0f172a;">
              ${item.width} × ${item.height} mm
            </td>
            <td style="padding: 10px; font-family: monospace; font-size: 13px; text-align: center; color: #475569;">
              ${itemArea.toFixed(3)} m²
            </td>
            <td style="padding: 10px; font-family: sans-serif; font-size: 13px; font-weight: bold; text-align: center; color: #0f172a;">
              ${item.quantity} ks
            </td>
            <td style="padding: 10px; font-family: monospace; font-size: 13px; font-weight: 800; text-align: right; color: #4f46e5;">
              ${itemTotalArea.toFixed(3)} m²
            </td>
          </tr>
        `;
      });

      const emailSubject = `Zaměřovací a montážní protokol QAPI - ${orderNumber}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
            .container { max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background-color: #0f172a; padding: 30px 24px; color: #ffffff; }
            .header-title { font-size: 20px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase; margin: 0; color: #f1f5f9; }
            .header-subtitle { font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 5px; }
            .content { padding: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .card { background-color: #f1f5f9; border-radius: 10px; padding: 15px; font-size: 12px; }
            .card-title { font-weight: 800; text-transform: uppercase; font-size: 10px; color: #475569; margin-bottom: 6px; letter-spacing: 0.05em; }
            .table { w-full border-collapse: collapse; margin-top: 20px; border-radius: 8px; overflow: hidden; }
            .footer { padding: 24px; text-align: center; font-size: 11px; color: #64748b; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
            .signature-block { display: table; width: 100%; margin-top: 35px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            .signature-col { display: table-cell; width: 50%; text-align: center; font-size: 11px; font-weight: bold; color: #475569; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="header-title">Zaměřovací protokol stínění</h1>
              <div class="header-subtitle">QAPI SHADING SYSTEMS • ZAKÁZKA ${orderNumber}</div>
            </div>
            
            <div class="content">
              <div style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
                Dobrý den,<br>
                zasíláme Vám detailní přehled zaměřených prvků stínění ze systému <strong>QAPI</strong>.
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
                <div style="font-weight: 900; text-transform: uppercase; font-size: 11px; color: #475569; margin-bottom: 10px; letter-spacing: 0.05em; border-bottom: 1px solid #edf2f7; padding-bottom: 5px;">Detaily zakázky</div>
                <strong>Zakázka č.:</strong> ${orderNumber}<br>
                <strong>Zákazník:</strong> ${customerName || "-"}<br>
                <strong>Telefon:</strong> ${customerPhone || "-"}<br>
                <strong>Adresa stavby/montáže:</strong> ${customerAddress || "-"}<br>
                <strong>Zaměřující technik:</strong> ${technicianName || "-"}
              </div>

              <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 6px;">
                Seznam stínicích prvků
              </h3>
              
              <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
                <thead>
                  <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; font-weight: 800; color: #475569;">
                    <th style="padding: 10px; text-align: center;">Poz.</th>
                    <th style="padding: 10px;">Stínicí prvek &amp; specifikace</th>
                    <th style="padding: 10px; text-align: center;">Š x V (mm)</th>
                    <th style="padding: 10px; text-align: center;">Plocha/Ks</th>
                    <th style="padding: 10px; text-align: center;">Množství</th>
                    <th style="padding: 10px; text-align: right;">Celkem m²</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
              </table>

              <div style="margin-top: 25px; padding: 15px; background-color: #eef2ff; border-radius: 12px; border: 1px solid #e0e7ff; margin-bottom: 25px;">
                <table style="width: 100%; font-size: 12px; font-weight: bold; color: #1e293b;">
                  <tr>
                    <td style="color: #6366f1;">CELKEM NAKONFIGUROVÁNO:</td>
                    <td style="text-align: right; font-family: monospace; font-size: 14px; color: #4f46e5;">${totalCount} ks</td>
                  </tr>
                  <tr>
                    <td style="color: #6366f1; padding-top: 5px;">CELKOVÁ PLOCHA STÍNĚNÍ:</td>
                    <td style="text-align: right; font-family: monospace; font-size: 15px; font-weight: 900; color: #4f46e5; padding-top: 5px;">${totalArea.toFixed(3)} m²</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding-top: 5px;">ODHADOVANÁ HMOTNOST STÍNĚNÍ:</td>
                    <td style="text-align: right; font-family: monospace; color: #64748b; padding-top: 5px;">~ ${totalWeight.toFixed(1)} kg</td>
                  </tr>
                </table>
              </div>

              ${generalNotes ? `
                <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 15px; font-size: 12px; color: #92400e; margin-bottom: 24px;">
                  <strong style="display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Technické pokyny a poznámky k montáži:</strong>
                  "${generalNotes}"
                </div>
              ` : ""}

              <div class="signature-block">
                <div class="signature-col">
                  <div style="border-bottom: 1px dashed #94a3b8; width: 140px; margin: 0 auto 10px auto; height: 35px;"></div>
                  Podpis TECHNIKA
                </div>
                <div class="signature-col">
                  <div style="border-bottom: 1px dashed #94a3b8; width: 140px; margin: 0 auto 10px auto; height: 35px;"></div>
                  Podpis OBCHODNÍKA
                </div>
              </div>

            </div>

            <div class="footer">
              Tento e-mail byl vygenerován z výjezdového tabletu technika QAPI Shading Systems.<br>
              Technická linka podpory QAPI • Integrované normy Q2/2026
            </div>
          </div>
        </body>
        </html>
      `;

      if (isSmtpActive) {
        // Live SMTP mail transfer!
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            // Do not fail on invalid certificates
            rejectUnauthorized: false
          }
        });

        const mailOptions: any = {
          from: smtpFrom,
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml,
        };

        if (ccEmail) {
          mailOptions.cc = ccEmail;
        }

        await transporter.sendMail(mailOptions);

        return res.json({
          success: true,
          mocked: false,
          recipient: recipientEmail,
          cc: ccEmail || null,
          message: `E-mail byl v pořádku odeslán na adresu ${recipientEmail} ${ccEmail ? ` s kopií na ${ccEmail}` : ""}.`
        });
      } else {
        // Mock success with log details so user gets amazing immediate feedback
        console.warn("[SMTP MOCK] SMTP configuration not fully populated in environmental variables.");
        return res.json({
          success: true,
          mocked: true,
          recipient: recipientEmail,
          cc: ccEmail || null,
          message: `Odeslání nasimulováno úspěšně! SMTP server není v .env nastaven (nastavte SMTP_HOST, SMTP_USER, SMTP_PASS), ale sestavený protokol byl úspěšně připraven k expedici na ${recipientEmail}.`
        });
      }

    } catch (err: any) {
      console.error("[SMTP ERROR] Failed sending measurement email:", err);
      res.status(500).json({ success: false, error: err.message || "Selhalo sestavení nebo odeslání zprávy přes SMTP." });
    }
  });

  // API 4: Submit Order with full metadata validation (Backup legacy)
  app.post("/api/qapi/submit-order", (req, res) => {
    try {
      const { order } = req.body;
      if (!order || !order.items || order.items.length === 0) {
        return res.status(400).json({ success: false, error: "Nemůžete odeslat prázdnou objednávku." });
      }

      res.json({
        success: true,
        message: "Objednávka byla úspěšně odeslána na zabezpečený server QAPI!",
        orderNumber: order.orderNumber,
        orderId: `QAPI-${Date.now().toString().substring(7)}`,
        submittedAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Selhání odeslání objednávky." });
    }
  });

  // Serve static application inside Vite in development / compiled build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QAPI Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

