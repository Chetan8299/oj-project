import dotenv from "dotenv";

dotenv.config();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export { COOKIE_OPTIONS };
