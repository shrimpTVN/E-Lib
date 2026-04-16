import loginRoute from "./login.route.js";
import registerRoute from "./register.route.js";
import bookRoute from "./book.route.js";
import borrowingRoute from "./borrow.route.js";
import favoriteRoute from "./favorite.route.js";
import readerRoute from "./reader.route.js";
import staffRoute from "./staff.route.js";
import publisherRoute from "./publisher.route.js";
import reviewRoute from "./review.route.js";

const router = (app) => {
  app.use("/api/login", loginRoute);
  app.use("/api/register", registerRoute);
  app.use("/api/books", bookRoute);
  app.use("/api/borrow", borrowingRoute);
  app.use("/api/favorites", favoriteRoute);
  app.use("/api/readers", readerRoute);
  app.use("/api/staffs", staffRoute);
  app.use("/api/publishers", publisherRoute);
  app.use("/api/reviews", reviewRoute);
};

export default router;
