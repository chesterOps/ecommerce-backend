import Order from "../models/order.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

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
  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: `tx-${Date.now()}`,
      currency: "USD",
      customer: {
        email,
        name: firstName,
      },
      customizations: {
        title: "Exclusive Shop",
        description: "Payment for items",
      },
      amount: amount.toString(),
      payment_options: "card",
      redirect_url: "https://www.google.com",
      meta: {
        city,
        phone,
        addressLine1,
        firstName,
        email,
        items: JSON.stringify(items),
        addressLine2: req.body?.addressLine2,
        companyName: req.body?.companyName,
        user: req.body?.user,
      },
    }),
  });

  // Get data
  const data = await response.json();

  console.log(data);

  if (!response.ok) return next(new AppError("Internal server error", 500));

  res.status(200).json({
    status: "success",
    data,
  });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH; // set in Flutterwave dashboard
  const signature = req.headers["verif-hash"];

  // Verify signature
  if (!signature || signature !== secretHash)
    return next(new AppError("Invalid signature", 400));

  const event = req.body;
  console.log("Webhook received:", event);

  // Handle event (e.g., charge.completed)
  if (
    event.event === "charge.completed" &&
    event.data.status === "successful"
  ) {
    // Get meta
    const {
      items,
      city,
      phone,
      addressLine1,
      firstName,
      email,
      addressLine2,
      companyName,
    } = event.data.meta;

    // Get items
    const cart = JSON.parse(items);

    // Create the order
    await Order.create({
      billingAddress: {
        name: firstName,
        companyName,
        email,
        city,
        phone,
        addressLine1,
        addressLine2,
      },
      status: "paid",
      items: cart,
      ref: event.data.tx_ref,
    });
  }

  // Send response
  res.status(200).json({
    status: "success",
    payStatus: event.data.status,
  });
});
