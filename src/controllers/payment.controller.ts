import Order from "../models/order.model";
import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

export const pay = catchAsync(async (req, res, next) => {
  // Get fields
  const {
    firstName,
    email,
    amount,
    phone,
    items,
    city,
    addressLine1,
    saveAddress,
  } = req.body;

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

  // Save address to user profile
  if (saveAddress && res.locals.user) {
    // Update user
    await User.findByIdAndUpdate(res.locals.user._id, {
      billingAddress: {
        name: firstName,
        email,
        city,
        phone,
        addressLine1,
        addressLine2: req.body.addressLine2,
        companyName: req.body.companyName,
      },
    });
  }

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
      redirect_url: "https://exclusiveng.netlify.app",
      meta: {
        city,
        phone,
        addressLine1,
        firstName,
        email,
        items: JSON.stringify(items),
        addressLine2: req.body.addressLine2,
        companyName: req.body.companyName,
        user: res.locals.user?._id,
      },
    }),
  });

  // Get data
  const data = await response.json();

  if (!response.ok) return next(new AppError("Internal server error", 500));

  res.status(200).json({
    status: "success",
    data,
  });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers["verif-hash"];

  // Verify signature
  if (!signature || signature !== secretHash)
    return next(new AppError("Invalid signature", 400));

  const event = req.body;

  // Process the event
  if (event.status === "successful") {
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
      user,
    } = event.meta_data;

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
        user,
      },
      status: "paid",
      items: cart,
      ref: event.txRef,
    });
  }

  // Send response
  res.status(200).json({
    status: "success",
    payStatus: event.status,
  });
});
