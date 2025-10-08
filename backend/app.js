require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const Stripe = require("stripe");

// Routers
const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const checkoutRouter = require("./routes/checkout");
const setupSwagger = require("./swagger");

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001", // dynamic for local or Render
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production", // true when deployed with HTTPS
    },
  })
);

// API Routes
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/checkout", checkoutRouter);

//Swagger
setupSwagger(app);


app.get("/api", (req, res) => {
  res.send("E-Commerce API running");
});

// Stripe test route 
app.post("/api/checkout/create-payment-intent", async (req, res) => {
  try {
    const { items } = req.body;
    const amount = items.reduce(
      (total, item) => total + item.price * item.quantity * 100,
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/build");
  console.log("Serving React build from:", buildPath);

  app.use(express.static(buildPath));

  // All other routes → React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

module.exports = app;
