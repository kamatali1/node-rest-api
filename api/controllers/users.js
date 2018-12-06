const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.register_user = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(result =>{
            if(result.length == 0){
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(hash) {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
            
                        user
                        .save()
                        .then(result =>{
                            console.log(result);
                            res.status(201).json({
                                message:'User created',
                                user:{
                                    id: result._id,
                                    email: result.email
                                },
                                request:{
                                    type:'GET',
                                    url:'/user/' + result._id
                                }
                            });
                        })
                        .catch(err => { 
                            console.log(err);
                            res.status(500).json({err:err});
                        });
                    }
                    else{
                        return res.status(500).json({ error: err});
                    }
                });
            }else{
                return res.status(409).json({
                    message:'Email already exists'
                });
            }
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({err:err});
        });
};

exports.user_login = (req, res, next) =>{
    User.find({email: req.body.email})
        .exec()
        .then( user =>{
            if(user.length >0){
                bcrypt.compare(req.body.password, user[0].password,(err, result) => {
                    if(result){
                        const token = jwt.sign({
                            email:user[0].email,
                            userId: user[0]._id
                        }, 
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                        );
                        return res.status(200).json({
                            message: 'Authentication was successful',
                            token:token
                        });
                    }else {
                        return res.status(401).json({
                            message:'Authentication failed'
                        });
                    }
                });
            }else{
                return res.status(401).json({
                    message:'Authentication failed'
                });
            }
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({err:err});
        });
};

exports.get_all_users = (req, res, next) => { 
    User.find()
        .select('email _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc =>{
                    return {
                        id: doc._id,
                        email: doc.email,
                        request: {
                            type: 'GET',
                            url: '/user/'+ doc._id
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

exports.get_user_by_id = (req,res,next) =>{
    const id = req.params.userId;
    User.findById(id)
        .select('email _id')
        .exec()
        .then(doc => {
            if(doc){
                res.status(200).json({
                    user: {
                        id: doc._id,
                        email: doc.email
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

exports.update_user = (req,res,next) =>{
    const id = req.params.userId;

    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    User.updateOne({ _id : id }, { $set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message:'User successfully updated',
                request: {
                    type: 'GET',
                    url:'/user/'+ id,
                    description: 'Updated user details'
                }
            });
        })
        .catch(err => {
            res.status(500).json({err : err});
            console.log(err)
        });
};

exports.remove_user = (req,res,next) =>{
    const id = req.params.userId;
    User.deleteOne({ _id : id })
    .exec()
    .then(
        res.status(200).json({
        message:'User deleted'
    }))
    .catch(err => {
        res.status(500).json({err : err});
        console.log(err)
    });
};

exports.change_user_password = (req,res,next) =>{
    const id = req.params.userId;
    User.findOne({_id: id})
    .exec()
    .then(result =>{
        if(result){
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(hash) {
                    User
                    .updateOne({_id: result._id}, {password: hash})
                    .exec()
                    .then(user =>{
                        res.status(200).json({
                            message:'Password successfully changed',
                            request:{
                                type:'GET',
                                url:'/user/' + id
                            }
                        });
                    })
                    .catch(err => { 
                        console.log(err);
                        res.status(500).json({err:err});
                    });
                }
                else{
                    return res.status(500).json({ error: err});
                }
            });
        }else{
            return res.status(409).json({
                message:'Wrong credentials'
            });
        }
    })
    .catch(err => { 
        console.log(err);
        res.status(500).json({err:err});
    });
};