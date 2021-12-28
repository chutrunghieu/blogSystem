const category = require("../models/categoryM");
const users = require("../models/usersM");
const article = require("../models/articleM");
const comment = require("../models/commentM");
const account = require("../models/accountM");
var bcrypt = require("bcrypt");
const bookmarks = require("../models/bookmarksM");

exports.getAdminPage = async (req, res, next) => {
  try {
    const categories = await category.find({}).exec();
    const articles = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: 'author' }])
      .sort({ views: -1 })
      .limit(5)
      .exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
    const comments = await comment.find({}).exec();

    return res.render("admin/admin_home", {
      category: categories,
      article: articles,
      article1: articles1,
      comment: comments,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.adminBlog = async (req, res, next) => {
  const perPage = 4;
  var page = req.query.page || 1;
  try {
    const categories = await category.find({}).exec();
    const count = await article.countDocuments();
    const articles = await article
      .find({ status: "publish" })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .populate([{ path: "category_name" }, { path: 'author' }])
      .exec();
    const comments = await comment.find({}).exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
    return res.render("admin/blog", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage)
      },
      category: categories,
      article1: articles1,
      article: articles,
      comment: comments,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await category.find({});
    return res.render("./admin/categories", {
      category: categories,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getEditCategory = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const editCategory = await category.findOne({ _id: _id });
    return res.render("admin/edit_category", {
      editCategory: editCategory
    });
  } catch (err) {
    console.log(err);
  }
};

exports.editCategory = (req, res, next) => {
  const { name, description, _id } = req.body;

  const newValue = {};
  if (req.file) {
    const image = req.file.filename;
    newValue.image = image;
  }
  if (description) newValue.description = description;
  if (name) newValue.name = name;

  category.findByIdAndUpdate({ _id: _id }, { $set: newValue }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      return res.redirect("/admin/categories");
    }
  });
};


exports.createCategory = async (req, res, next) => {
  const { name, description, create_date, image } = req.body;
  try {
    const check = await category.findOne({ name: name });
    if (check) {
      const msg = "This category is already exist !";
      return res.redirect(`/admin/categories?msg=${msg}`);
    } else {
      const newCategory = await new category({
        name: name,
        description: description,
        image: req.file.filename,
      });
      await newCategory.save();
      const msg = "Successfully !";
      return res.redirect(`/admin/categories?msg=${msg}`);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { _id } = req.body;
  await category.findOneAndRemove({ _id: _id }, (err) => {
    if (err) {
      console.log(err);
      return res.redirect("/admin/categories");
    } else {
      console.log("======================================");
      console.log("Delete successfully");
      return res.redirect("/admin/categories");
    }
  });
};

exports.acceptArticle = async (req, res, next) => {
  const { _id } = req.body;
  try {
    await article.findByIdAndUpdate(
      { _id: _id },
      { $set: { status: "publish" } }
    );

    return res.redirect("/admin/articleCensorship");
  } catch (err) {
    console.log(err);
  }
};
exports.rejectArticle = async (req, res, next) => {
  const { _id } = req.body;
  try {
    await article.findByIdAndUpdate(
      { _id: _id },
      { $set: { status: "draft" } }
    );

    return res.redirect("/admin/articleCensorship");
  } catch (err) {
    console.log(err);
  }
};
exports.unpublish = async (req, res, next) => {
  const { _id } = req.body;
  try {
    const findArticle = await article.findByIdAndUpdate(
      { _id: _id },
      { $set: { status: "pending" } }
    );
    const findBookmarks = await bookmarks.findOneAndRemove({ article_id: findArticle._id });
    if(findBookmarks){
    await users.findOneAndUpdate({ bookmarks_id: findBookmarks._id }, { $pull: { bookmarks_id: findBookmarks._id } });
    }
    return res.redirect("/admin/articleCensorship");
  } catch (err) {
    console.log(err);
  }
};

exports.articleCensorship = async (req, res, next) => {
  try {
    const articles = await article
      .find({ status: "pending" })
      .populate("category_name", "name")
      .exec();

    const publish = await article
      .find({ status: "publish" })
      .populate("category_name", "name").sort({write_date: -1})
      .exec();

    return res.render("admin/article_censorship", {
      article: articles,
      publish: publish,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.adminPostDetails = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const user = await users.findOne({ account_id: req.session.userId });

    const categories = await category.find({}).exec();
    const articles = await article
      .findOne({ _id: _id })
      .populate([{ path: "category_name" }, { path: "author" }])
      .exec();
    const comments = await comment.find({ article: articles._id }).populate('author').exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
    return res.render("admin/post_details", {
      user: user,
      category: categories,
      article: articles,
      article1: articles1,
      comment: comments,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.viewArticle = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const user = await users.findOne({ account_id: req.session.userId });

    const categories = await category.find({}).exec();
    const articles = await article
      .findOne({ _id: _id })
      .populate([{ path: "category_name" }, { path: "author" }])
      .exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
    return res.render("admin/view_article", {
      user: user,
      category: categories,
      article: articles,
      article1: articles1,
    });
  } catch (error) {
    console.log(error);
  }
};


exports.searchCategory = async (req, res, next) => {
  const { search } = req.query;
  let re = new RegExp(search, 'i')
  try {
    const search = await category.find({ name: re })

    return res.render('admin/categories', {
      category: search
    })
  } catch (error) {
    console.log(error)
  }
}

exports.getSetting = async (req, res, next) => {
  const { msg } = req.query;
  try {
    const acc = await account.findOne({ _id: req.session.userId }).exec();

    return res.render("admin/settings", {
      err: msg,

      user: acc,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, newPassword2 } = req.body;
  const changePassword = {};
  if (newPassword) changePassword.password = newPassword;
  account.findOne({ _id: req.session.userId }).exec((err, user) => {
    if (err) {
      console.log(err);
    } else {
      bcrypt.compare(oldPassword, user.password, async (err, same) => {
        if (same) {
          if (user == newPassword) {
            const msg = "Same old password";
            return res.redirect(`/admin/setting?msg=${msg}`);
          } else if (newPassword.length < 4) {
            const msg = "Password must be at least 4 characters !";
            return res.redirect(`/admin/setting?msg=${msg}`);
          } else if (newPassword != newPassword2) {
            const msg = "Confirm password wrong !";
            return res.redirect(`/admin/setting?msg=${msg}`);
          } else {
            await account.findOneAndUpdate(
              { _id: user._id },
              { $set: changePassword },
              { new: true }
            );
            const msg = "Change Password Success !";
            return res.redirect(`/admin/setting?msg=${msg}`);
          }
        } else {
          const msg = "Wrong Old Password !";
          return res.redirect(`/admin/setting?msg=${msg}`);
        }
      });
    }
  });
};

exports.search = async (req, res, next) => {
  const { search } = req.query;
  const keySearch = req.query.search;
  const page = req.query.page || 1;
  let re = new RegExp(keySearch, "i");
  const perPage = 4;
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const categories = await category.find({}).exec();
    const articles = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
      .exec();
    const searchArticle = await article
      .find({
        $and: [{ title: re }, { status: "publish" }],
      })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ views: -1 });
    const count = await article.countDocuments({ $and: [{ title: re }, { status: "publish" }] });

    return res.render("admin/blog", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      user: user,
      article1: articles,
      category: categories,
      article: searchArticle,
      search,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.findCategory = async (req, res, next) => {
  const _id = req.params.id;
  const perPage = 4;
  var page = req.query.page || 1;
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const categories = await category.find({}).exec();
    const findCategory = await category.findOne({ _id: _id });
    const count = await article.countDocuments({
      category_name: findCategory._id, status: "publish"
    });
    console.log(count)
    const articles = await article
      .find({ category_name: findCategory._id, status: "publish" })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate([{ path: "category_name" }, { path: "author" }])
      .exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
      .exec();
    return res.render("admin/category", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      user: user,
      find: findCategory,
      article1: articles1,
      article: articles,
      category: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

