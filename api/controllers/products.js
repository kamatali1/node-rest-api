const mongoose = require('mongoose');
const Product = require('../models/product');

exports.get_all_producs = (req, res, next) => { 
    Product.find()
        .select('name price _id image')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc =>{
                    return {
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        image: doc.image,
                        request: {
                            type: 'GET',
                            url: '/products/'+ doc._id
                        }
                    }

                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({err : err});
        });
};

exports.create_product = (req, res, next) => {

    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        image: req.file.path
    });

    product
        .save()
        .then(result => {
            res.status(201).json({
                message:'Product was created',
                product: {
                    id: result._id,
                    name: result.name,
                    price: result.price,
                    image: result.image,
                    request: {
                        type:'GET',
                        url:'/products/' + result._id
                    }
                }
            });
            console.log(result);
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({err:err});
        });
};

exports.get_product = (req,res,next) =>{
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id image')
        .exec()
        .then(doc => {
            if(doc){
                res.status(200).json({
                    product: {
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        image: doc.image
                    }
                });
            }else
            {
                res.status(404).json({message: 'No record found matching this id'});
                console.log('No record found matching this id')
            }  
        })
        .catch(err => {
            res.status(500).json({err : err});
            console.log(err)
        });
};

exports.update_product = (req,res,next) =>{
    const id = req.params.productId;

    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id : id }, { $set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message:'Prdocted successfully updated',
                request: {
                    type: 'GET',
                    url:'/products/'+ id,
                    description: 'Updated product'
                }
            });
        })
        .catch(err => {
            res.status(500).json({err : err});
            console.log(err)
        });
};

exports.change_product_image = (req, res, next) => {
    const id = req.params.productId;
    Product.updateOne({_id: id}, {image: req.file.path})
    .exec()
    .then(result => {
        res.status(200).json({
            message:'Prdocted successfully updated',
            request: {
                type: 'GET',
                url:'/products/'+ id,
                description: 'Updated product'
            }
        });
    })
    .catch(err => {
        res.status(500).json({err : err});
        console.log(err)
    });
};

exports.delete_product = (req,res,next) =>{
    const id = req.params.productId;
    Product.deleteOne({ _id : id })
    .exec()
    .then(
        res.status(200).json({
        message:'Product deleted',
        request:{
            type:'POST',
            url:'/products',
            body:{name:'String', price:'Number'},
            description:'Create a new product'
        }
}))
    .catch(err => {
        res.status(500).json({err : err});
        console.log(err)
    });
};