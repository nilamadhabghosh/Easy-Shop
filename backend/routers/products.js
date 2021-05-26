const {Product} = require('../models/product');
const {Category} = require('../models/category');

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req,res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',')};
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList) res.status(500).json({ success: false })
    res.send(productList)
});

router.get(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ success: false, message: 'Invalid Product Id'});
    }
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false, message: 'product not found' })
    }

    res.status(200).send(product);
});

router.post(`/`, async (req,res) => {
    const category = await Category.findById(req.body.category);
    if(!category) res.status(400).send({ success: false, message: 'Invalid category'});

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();

    if(!product) {
        res.status(500).send({ success: false, message: 'Product cannot be created'});
    }

    res.status(201).send(product);
});

router.put(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ success: false, message: 'Invalid Product Id'});
    }
    const category = await Category.findById(req.body.category);
    if(!category) res.status(400).send({ success: false, message: 'Invalid category'});

    const product = await Product.findByIdAndUpdate( req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, {new: true});

    if(!product) {
        return res.status(500).send({ success: false, message: 'Category cannot be updated'})
    }

    res.send(product);
})

router.delete(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ success: false, message: 'Invalid Product Id'});
    }
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).send({ success: true, message: 'Product is deleted'})
        } else {
            return res.status(404).json({ success: false, message: 'product not found'})
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, message: err })
    })
})

router.get(`/get/count`, async (req,res) => {
    const productCount = await Product.countDocuments((count) => count);
    if(!productCount) res.status(500).json({ success: false })
    res.send({
        productCount: productCount
    })
});

router.get(`/get/featured/:count`, async (req,res) => {
    const count = req.params.count || 0;
    const products = await Product.find({isFeatured: true}).limit(+count);
    if(!products) res.status(500).json({ success: false })
    res.send(products)
});

module.exports = router;
