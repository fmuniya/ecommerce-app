const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const setupSwagger = require('./swagger');
const cors = require('cors');
const session = require('express-session');


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

// Swagger docsroute
setupSwagger(app);

app.get('/', (req, res) => {
  res.send('E-Commerce API running');
});

module.exports = app;
