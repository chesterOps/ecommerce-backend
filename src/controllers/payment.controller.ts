import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import crypto from "crypto";

export const pay = catchAsync(async (req, res, next) => {
  // Get fields
  const { firstName, email, amount, phone, items, city, addressLine1 } =
    req.body;

  // Check for fields
  if (
    !firstName ||
    !email ||
    !amount ||
    !city ||
    !addressLine1 ||
    !phone ||
    !items?.length
  )
    return next(new AppError("Invalid data format", 400));

  // Send request
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: req.body.amount * 100,
        currency: "USD",
        callback_url: "https://www.google.com",
        metadata: req.body,
      }),
    }
  );

  if (!response.ok) return next(new AppError("Internal server error", 500));

  // Get data
  const data = await response.json();

  res.status(200).json({
    status: "success",
    data,
  });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  // Verify payment signature
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET!)
    .update((req as any).rawBody)
    .digest("hex");

  // Signature
  const signature = req.headers["x-paystack-signature"];

  // Check for paystack signature
  if (signature !== expected)
    return next(new AppError("Invalid signature", 400));

  // Assign body
  const event = req.body;

  // Check if charge was successful
  if (event.event === "charge.success") {
    // Create new order
    console.log(event.data);
  }

  // Send response
  res.status(200).json({
    status: "success",
    payStatus: event.event,
  });
});
