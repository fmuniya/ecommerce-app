const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const setupSwagger = require('./swagger');

app.use(express.json());

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
