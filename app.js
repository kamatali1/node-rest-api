const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan'); //loging package
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/finclub.ml/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/finclub.ml/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/finclub.ml/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};


mongoose.connect('mongodb+srv://db-admin_1:'+ process.env.MONGO_ATLAS_PWD +'@cluster0-sqdle.mongodb.net/test?retryWrites=true',{
    useNewUrlParser: true
});

mongoose.Promise = global.Promise;

//Routes
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');


app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Disable CORS
app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin','*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Accept, Content-Type, Authorization");

    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json({});
    }

    next();
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

//catch error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: error.message
    });
});

module.exports = app;