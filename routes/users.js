var express = require("express");
var router = express.Router();
var auth = require("../controllers/usersC");
var { multerInstance} = require("../middleware/upload");
var { isUsers } = require("../middleware/login");

/* GET users listing. */
router.get("/users_home", isUsers, auth.getUsersHomePage);
router.get('/blog',isUsers, auth.usersBlog);
router.get('/post-details/:id',isUsers, auth.usersPostDetails);

router.get("/articles", isUsers, auth.getArticles);

router.get("/write_article", isUsers, auth.getWriteArticle);
router.post("/writeArticle", multerInstance, isUsers, auth.writeArticle);


router.get("/editArticle/:id", isUsers, auth.getEditArticle);
router.post("/editArticle", multerInstance, isUsers, auth.editArticle);

router.delete("/deleteArticle", isUsers, auth.deleteArticle);

router.put("/publishing", isUsers, auth.publishing);
router.put("/unpublish", isUsers, auth.unpublish);

router.get("/getBookmarks", isUsers, auth.getBookmarks);
router.put("/bookmarks/:id", isUsers, auth.bookmarks);
router.delete("/unBookmark", isUsers, auth.unBookmark);

router.post("/doComment", isUsers, auth.doComment);
router.delete("/deleteComment", isUsers, auth.deleteComment);

router.post('/updateInfo', multerInstance, isUsers, auth.setting);
router.post('/changePassword', isUsers, auth.changePassword);
router.get('/setting', isUsers, auth.getSetting);

router.get('/search', isUsers, auth.search);
router.get('/blogByCategory/:id',isUsers, auth.findCategory);



module.exports = router;
