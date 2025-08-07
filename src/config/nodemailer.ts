const nodemailerConfig = {
  service: "gmail",
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

export default nodemailerConfig;
