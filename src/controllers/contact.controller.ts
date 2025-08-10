import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import Email from "../utils/email";

export const contact = catchAsync(async (req, res, next) => {
  // Get fields
  const { name, email, phone, message } = req.body;

  // Check for fields
  if (!name || !email || !phone || !message)
    return next(new AppError("All fields are required", 400));

  try {
    // Send email
    await new Email({
      url: undefined,
      to: `${process.env.SUPPORT_EMAIL}`,
    }).sendMessage({
      name,
      email,
      phone,
      message,
    });
  } catch (err: any) {
    // Return error
    return next(new AppError(err.message, 500));
  }

  // Send response
  res.status(200).json({
    status: "success",
    message: "Your message has been sent",
  });
});
