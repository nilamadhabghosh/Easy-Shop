const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Enabling Cors
app.use(cors());
app.options('*', cors());

require('dotenv/config')

const api = process.env.API_URL;

const productsRouter = require('./routers/products');
const categoryRouter = require('./routers/categories');
const userRouter = require('./routers/users');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

// Middle ware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

// Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);

app.listen(3003, () => {
    console.log(api);
    console.log('server is running on port https://localhost:3003')
})

mongoose.connect(process.env.CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log('database connection established 👍');
})
.catch((err) => {
    console.log('error connecting database 🙈 '+ err.message);
})
