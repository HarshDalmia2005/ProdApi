export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "PRODUCTION",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  }),

  set: (res, name, val, options = {}) => {
    res.cookie(name, val, { ...cookies.getOptions(), ...options });
  },

  clear: (res, name, options = {}) => {
    res.clearCookie(name, { ...cookies.getOptions(), ...options });
  },

  get: (req, name) => {
    return req.cookies[name];
  },
};
