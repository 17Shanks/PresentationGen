const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { generatePresentation } = require("./presentationGenerator");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.post("/api/generate", async (req, res) => {
  const { email, topic } = req.body;

  if (!email || !topic) {
    return res.status(400).json({ error: "Email and topic are required" });
  }

  try {
    const pptPath = await generatePresentation(topic);
    
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Generated Presentation",
      text: "Attached is your requested presentation.",
      attachments: [{ filename: "presentation.pptx", path: pptPath }],
    });

    res.json({ message: "Presentation sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate presentation" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
