import loginRoute from "./login.route.js";
import registerRoute from "./register.route.js";
import bookRoute from "./book.route.js";
import borrowingRoute from "./borrowing.route.js";
import favoriteRoute from "./favorite.route.js";
import readerRoute from "./reader.route.js";
import staffRoute from "./staff.route.js";

const router = (app) => {
  app.use("/login", loginRoute);
  app.use("/register", registerRoute);
  app.use("/api/books", bookRoute);
  app.use("/api/borrowings", borrowingRoute);
  app.use("/api/favorites", favoriteRoute);
  app.use("/api/readers", readerRoute);
  app.use("/api/staffs", staffRoute);
};

export default router;
