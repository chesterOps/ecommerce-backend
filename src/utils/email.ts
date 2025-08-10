import nodemailer from "nodemailer";
import pug from "pug";
import nodemailerConfig from "../config/nodemailer";
import { convert } from "html-to-text";

export default class Email {
  options: { url: string; from: string; to: string };

  constructor(options: { url: string; to: string }) {
    this.options = {
      url: options.url,
      to: options.to,
      from: `${process.env.EMAIL_USER}`,
    };
  }

  // Create transport
  private createTransport() {
    return nodemailer.createTransport(nodemailerConfig);
  }

  // Send email
  private async send(template: string, subject: string) {
    // Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../email/${template}.pug`, {
      url: this.options.url,
      subject,
      year: new Date(Date.now()).getFullYear(),
    });

    // Define email options
    const mailOptions = {
      from: this.options.from,
      to: this.options.to,
      subject,
      html,
      text: convert(html),
    };

    // Create transport and send email
    await this.createTransport().sendMail(mailOptions);
  }

  // Password reset
  async sendPasswordReset() {
    await this.send("passwordReset", "Reset password");
  }
}
