const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
// const helmet = require("helmet");
// const morgan = require("morgan");

// Load environment variables
dotenv.config();
const { handleDatabaseBoxErrors } = require("./middleware.js");
const usersAuthRoutes = require("./routes/usersAuth");
const usersRoutes = require("./routes/users.js");
const g5BoxesRoutes = require("./routes/g5Boxes.js");
const g5CardsRoutes = require("./routes/g5Cards.js");

const { connectDB } = require("./config/db");
// Create Express app
const app = express();
// Middleware
app.use(cors());
// app.use(helmet());
// app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);
app.use("/", usersAuthRoutes);
app.use("/users", usersRoutes);
app.use("/g5Boxes", g5BoxesRoutes);
app.use(handleDatabaseBoxErrors);
app.use("/g5Cards", g5CardsRoutes);
// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Pejman-SERN-Academy!",
  });
});
// Port
const PORT = process.env.PORT || 5000;
// Connect database first
connectDB();
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
