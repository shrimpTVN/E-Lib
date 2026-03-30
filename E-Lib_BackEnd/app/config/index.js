const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/E-Lib",
  },
};

export default config;
