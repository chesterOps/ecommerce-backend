const cookieConfig: {
  httpOnly: boolean;
  maxAge: number;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
} = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export default cookieConfig;
