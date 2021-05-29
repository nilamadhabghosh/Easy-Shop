const {Product} = require('../models/product');
const {Category} = require('../models/category');

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer  = require('multer');

// Image upload
const FILE_TYPE = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE[file.mimetype];
        let uploadError = new Error('invalid image upload');
        if (isValid) {
            uploadError = null;
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(' ', '-');
      const extension = FILE_TYPE[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
const uploadOptions = multer({ storage: storage })

// Product APIS
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

router.post(`/`,uploadOptions.single('image'), async (req,res) => {
    const category = await Category.findById(req.body.category);
    if(!category) res.status(400).send({ success: false, message: 'Invalid category'});

    const file = req.file;
    if(!file) res.status(400).send({ success: false, message: 'No Image in the request'});
    
    const fileName = req.file.filename;
    const basePath = `${req.protocol}//${req.get('host')}/public/upload/`

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
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

router.put(`/:id`,uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ success: false, message: 'Invalid Product Id'});
    }
    const category = await Category.findById(req.body.category);
    if(!category) res.status(400).send({ success: false, message: 'Invalid category'});

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send({ success: false, message: 'Inavlid product Id'});

    const file = req.file;
    let imagePath;
    if(file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}//${req.get('host')}/public/upload/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image
    }

    const updateProduct = await Product.findByIdAndUpdate( req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagePath,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, {new: true});

    if(!updateProduct) {
        return res.status(500).send({ success: false, message: 'Category cannot be updated'})
    }

    res.send(updateProduct);
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

router.put(`/gallery-images/:id`,uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ success: false, message: 'Invalid Product Id'});
    }
    
    const files = req.files;
    let imagePaths = [];
    const basePath = `${req.protocol}//${req.get('host')}/public/upload/`;

    if (files) {
        files.map(file => {
            imagePaths.push(`${basePath}${file.filename}`)
        })
    }

    const updateProduct = await Product.findByIdAndUpdate( req.params.id, {
        images: imagePaths
    }, {new: true});

    if(!updateProduct) {
        return res.status(500).send({ success: false, message: 'Category cannot be updated'})
    }

    res.send(updateProduct);
});

module.exports = router;
