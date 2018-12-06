const express = require('express');
const router = express.Router();
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');
const ProductController = require('../controllers/products');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }else{
        cb(new Error('Unsupported file: choose *.jpg or *.png not exceeding 2MB'), false);
    }
}
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileFilter
});

router.get('/', ProductController.get_all_producs);
router.post('/', checkAuth, upload.single('image'), ProductController.create_product);
router.get('/:productId', ProductController.get_product);
router.patch('/:productId', checkAuth, ProductController.update_product);
router.delete('/:productId', checkAuth, ProductController.delete_product);
router.patch('/change-image/:productId', checkAuth, upload.single('image'), ProductController.change_product_image);

module.exports = router;