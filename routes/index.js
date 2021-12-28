var express = require('express');
var router = express.Router();
var auth = require('../controllers/indexC');
/* GET home page. */
router.get('/', auth.homePage);
router.get('/post-details/:id', auth.postDetails);
router.get('/contact', auth.contact);
router.get('/blog', auth.blog);

router.get('/blogByCategory/:id', auth.findCategory);

router.get('/search', auth.search);

module.exports = router;
