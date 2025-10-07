require("dotenv").config();

const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const setupSwagger = require('./swagger');
const cors = require('cors');
const session = require('express-session');
const Stripe = require("stripe");


const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// Allow requests from your frontend origin
app.use(cors({
  origin: 'http://localhost:3001',  // frontend URL
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());

// session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', 
  resave: false,        // avoid saving session if nothing changed
  saveUninitialized: false, // don't save empty sessions
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: process.env.NODE_ENV === "production", // true,          
    secure: false            // set true if using HTTPS
  }
}));

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use("/api/checkout", require("./routes/checkout"));

// Swagger docsroute
setupSwagger(app);

app.get('/', (req, res) => {
  res.send('E-Commerce API running');
});

// === Stripe Checkout Route (Test Mode) ===
app.post("/api/checkout/create-payment-intent", async (req, res) => {
  try {
    const { items } = req.body;

    // Example: simple calculation (you can modify for your actual prices)
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
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = app;
