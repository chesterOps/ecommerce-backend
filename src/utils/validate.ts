// Email validation
export const validateEmail = {
  validator: function (value: string) {
    return /\S+@\S+\.\S+/.test(value);
  },
  message: "Email is invalid",
};

// Password validation
export const validatePassword = {
  validator: function (value: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/.test(
      value
    );
  },
  message:
    "Password must be at least 8 characters and include an uppercase, lowercase, number, and special character",
};
