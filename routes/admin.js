var express = require('express');
var router = express.Router();
var auth = require("../controllers/adminC");
var { multerInstance } = require("../middleware/upload");
var {isAdmin} = require("../middleware/login");
/* GET users listing. */
router.get('/admin_home', isAdmin, auth.getAdminPage);
router.get('/post-details/:id',isAdmin, auth.adminPostDetails);
router.get('/searchCategory',isAdmin, auth.searchCategory);
router.get('/blog',isAdmin, auth.adminBlog);
router.get('/setting',isAdmin, auth.getSetting);

router.get('/viewArticle/:id',isAdmin, auth.viewArticle);

router.get("/editCategory/:id", isAdmin, auth.getEditCategory);
router.post("/editCategory", multerInstance, isAdmin, auth.editCategory);

router.get("/categories", isAdmin, auth.getCategories);

router.post('/createCategory', multerInstance, isAdmin, auth.createCategory);
router.post('/changePassword', isAdmin, auth.changePassword);

router.delete('/deleteCategory', isAdmin , auth.deleteCategory);

router.get('/articleCensorship', isAdmin, auth.articleCensorship);
router.put("/unpublish", isAdmin, auth.unpublish);
router.put("/acceptArticle", isAdmin, auth.acceptArticle);
router.put("/rejectArticle", isAdmin, auth.rejectArticle);

router.get('/blogByCategory/:id',isAdmin, auth.findCategory);

router.get('/search',isAdmin, auth.search);


module.exports = router;
