import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword } from "../utils/validate";

// User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: validateEmail,
    },
    address: {
      type: String,
    },
    billingAddress: {
      name: { type: String, required: true },
      addressLine1: {
        type: String,
        required: [true, "Address is required"],
      },
      addressLine2: { type: String },
      companyName: { type: String },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: validatePassword,
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    token: {
      type: {
        expires: {
          type: Date,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
      select: false,
    },
  },
  {
    methods: {
      // Verify password
      async verifyPassword(password: string, dbPassword: string) {
        return await bcrypt.compare(password, dbPassword);
      },

      // Generate token
      createToken() {
        // Create token
        const token = crypto.randomBytes(32).toString("hex");

        // Update token field
        this.token = {
          expires: new Date(Date.now() + 15 * 60 * 1000),
          value: crypto.createHash("sha256").update(token).digest("hex"),
        };

        // Return token
        return token;
      },

      // Check if password was changed after token was issued
      changedPasswordAfter(tokenTimestamp: number) {
        // Check for field
        if (this.passwordChangedAt) {
          // Get timestamp when password was changed
          const changedTimestamp = parseInt(
            (this.passwordChangedAt.getTime() / 1000).toString(),
            10
          );

          // Compare values
          return tokenTimestamp < changedTimestamp;
        }

        return false;
      },
    },
    timestamps: true,
  }
);

// Encrypt password on save
userSchema.pre("save", async function (next) {
  // Check if password field was modified
  if (!this.isModified("password") || !this.password) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Updating password changed time
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now());
  next();
});

// Create user model
const User = mongoose.model("User", userSchema);

export default User;
