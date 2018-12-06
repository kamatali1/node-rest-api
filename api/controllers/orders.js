const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

exports.get_all_orders = (req, res, next) => {
    Order.find()
        .select('_id product quantity')
        .populate('product') //merge order with product based on ref
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
            orders: docs.map(doc =>{
                return {
                    id: doc._id,
                    product: {
                        name: doc.product.name,
                        image: doc.product.image
                    },
                    quantity: doc.quantity,
                    request: {
                        type:'GET',
                        url:'/orders/' + doc._id
                    }
                }
            })
            }
            res.status(200).json({response});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({err : err})
        });
};

exports.create_order = (req, res, next) => {
    Product.findById(req.body.product)
        .exec()
        .then(product =>{
            if(product) {
                const order = new Order ({
                    _id: mongoose.Types.ObjectId(),
                    product: req.body.product,
                    quantity: req.body.quantity
                });
            
                order.save()
                    .then(result => {
                        res.status(200).json({
                            message: 'Order successfully created',
                            order: {
                                id: result._id,
                                product: result.product,
                                quantity: result.quantity
                            },
                            request: {
                                type: 'GET',
                                url: '/orders/'+ result._id,
                                description: 'Get order details'
                            }
                        })
                    })
                    .catch(err =>{
                        console.log(err.message);
                        res.status(500).json({err : err});
                    });
            }else{
                res.status(404).json({message: 'Product not found'});
            }
        })
};

exports.get_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('_id product quantity')
        .populate('product', 'name price image')
        .exec()
        .then(result => {
            res.status(200).json({
                order:{
                    id: result._id,
                    product: {
                        name: result.product.name,
                        price: result.product.price,
                        image: result.product.image
                    },
                    quantity:result.quantity
                }
            })
        })
        .catch();
};

exports.patch_order = (req,res,next) =>{
    const id = req.params.orderId;

    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Order.updateOne({ _id : id }, { $set: updateOps})
        .exec()
        .then(
            res.status(200).json({
                message:'Order successfully updated',
                request: {
                    type: 'GET',
                    url:'/orders/'+ id,
                    description: 'View updated order'
                }
            })
        )
        .catch(err => {
            res.status(500).json({err : err});
            console.log(err)
        });
};

exports.delete_order = (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId})
    .exec()
    .then(
        res.status(200).json({
            message:'Order deleted',
            request:{
                type:'POST',
                url:'/orders',
                body:{
                    product:'String', quantity:'Number'
                },
                description:'Create a new order'
            }
        })
    )
    .catch(err =>{
        console.log(err); 
        res.status(500).json({err: err});
    });
};