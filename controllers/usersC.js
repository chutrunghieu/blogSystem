var article = require("../models/articleM");
var users = require("../models/usersM");
var category = require("../models/categoryM");
var account = require("../models/accountM");
var bookmarks = require("../models/bookmarksM");
var comment = require("../models/commentM");
var bcrypt = require("bcrypt");

exports.getUsersHomePage = async (req, res, next) => {
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const categories = await category.find({}).exec();
    const articles = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ views: -1 })
      .limit(5)
      .exec();
    const comments = await comment.find({}).exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5);

    return res.render("users/users_home", {
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

exports.usersBlog = async (req, res, next) => {
  const perPage = 4;
  var page = req.query.page || 1;
  try {
    const categories = await category.find({}).exec();
    const count = await article.countDocuments();
    const articles = await article
      .find({ status: "publish" })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate([{ path: "category_name" }, { path: "author" }])
      .exec();
    const comments = await comment.find({}).exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5);
    const user = await users.findOne({ account_id: req.session.userId });
    return res.render("users/blog", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
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

exports.usersPostDetails = async (req, res, next) => {
  const _id = req.params.id;
  const demo = {};
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const categories = await category.find({}).exec();
    const articles = await article
      .findOne({ _id: _id })
      .populate([{ path: "category_name" }, { path: "author" }])
      .exec();
    const comments = await comment
      .find({ article: articles._id })
      .populate("author")
      .exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5);
    await article.findOneAndUpdate({ _id: _id }, { $inc: { views: 1 } });
    const bookmark = await bookmarks.findOne({ article_id: _id, users_id: user._id });
    if (bookmark) {
      const bookmarkExists = await users.findOne({
        bookmarks_id: bookmark._id,
      });
      if (bookmarkExists) {
        demo["bookmarkExists"] = bookmarkExists;
      }
    }
    return res.render("users/post_details", {
      user: user,
      category: categories,
      article: articles,
      article1: articles1,
      comment: comments,
      bm: bookmark,
      demo,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getWriteArticle = async (req, res, next) => {
  const { msg } = req.query;
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const categories = await category.find({}).exec();
    return res.render("users/write_article", {
      category: categories,
      user: user,
      err: msg,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.writeArticle = async (req, res, next) => {
  const { title, description, content } = req.body;
  try {
    const User = await users.findOne({ account_id: req.session.userId });
    const value = await article.findOne({ title: title }).exec();
    if (value) {
      const msg = "This Article is already exist !";
      return res.redirect(`/users/write_article?msg=${msg}`);
    } else {
      const newArticle = new article({
        title: title,
        description: description,
        category_name: req.body.category_name,
        content: content,
        author: User._id,
        image: req.file.filename,
      });
      await newArticle.save();
      const msg1 = "Successfully!";
      return res.redirect(`/users/articles`);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getArticles = async (req, res, next) => {
  //const _id = req.query.id;
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const articles = await article
      .find({ author: user._id, status: "draft" })
      .populate("category_name", "name")
      .exec();
    const publish = await article
      .find({ author: user._id, status: "publish" })
      .populate("category_name", "name")
      .exec();
    const pending = await article
      .find({ author: user._id, status: "pending" })
      .populate("category_name", "name")
      .exec();
    return res.render("users/articles", {
      user: user,
      pending: pending,
      article: articles,
      publish: publish,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getEditArticle = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const articles = await article
      .findOne({ _id: _id })
      .populate({ path: "category_name", select: "name" })
      .exec();
    const categories = await category.find({}).exec();
    return res.render("users/edit_article", {
      user: user,
      article: articles,
      category: categories,
      _id: articles._id,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.editArticle = (req, res, next) => {
  const { title, description, category_name, content, _id } = req.body;

  const newValue = {};
  if (req.file) {
    const image = req.file.filename;
    newValue.image = image;
  }
  if (description) newValue.description = description;
  if (title) newValue.title = title;
  if (content) newValue.content = content;
  if (category_name) newValue.category_name = category_name;
  article.findByIdAndUpdate({ _id: _id }, { $set: newValue }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      return res.redirect("/users/articles");
    }
  });
};

exports.deleteArticle = async (req, res, next) => {
  const { _id } = req.body;
  await article.findOneAndRemove({ _id: _id }, (err) => {
    if (err) {
      console.log(err);
      return res.redirect("/users/articles");
    } else {
      console.log("======================================");
      console.log("Delete successfully");
      return res.redirect("/users/articles");
    }
  });
};

exports.publishing = async (req, res, next) => {
  const { _id } = req.body;
  try {
    await article.findByIdAndUpdate(
      { _id: _id },
      { $set: { status: "pending" } }
    );
    return res.redirect("/users/articles");
  } catch (err) {
    console.log(err);
  }
};

exports.unpublish = async (req, res, next) => {
  const { _id } = req.body;
  try {
    await article.findByIdAndUpdate(
      { _id: _id },
      { $set: { status: "draft" } }
    );
    return res.redirect("/users/articles");
  } catch (err) {
    console.log(err);
  }
};

exports.bookmarks = async (req, res, next) => {
  const _id = req.params.id;
  const User = await users.findOne({ account_id: req.session.userId });
  try {
    const newBookmarks = new bookmarks({
      article_id: _id,
      users_id: User._id,
    });
    const takeBookmark = await newBookmarks.save();
    await User.bookmarks_id.push(takeBookmark);
    await User.save();
    return res.redirect(`/users/post-details/${newBookmarks.article_id}`);
  } catch (err) {
    console.log(err);
  }
};

exports.getBookmarks = async (req, res, next) => {
  const user = await users.findOne({ account_id: req.session.userId });
  const bookmarksList = await bookmarks
    .find({users_id: user._id})
    .populate([
      {
        path: "article_id",
        populate: [{ path: "category_name" }, { path: "author" }],
      },
      { path: "users_id" },
    ])
    .exec();
  
  res.render("users/bookmarks", {
    bookmarks: bookmarksList,
    user: user,
  });
};

exports.doComment = async (req, res, next) => {
  const { content, blog_id } = req.body;
  const User = await users.findOne({ account_id: req.session.userId });
  const articles = await article.findOne({ _id: blog_id });

  try {
    const newComment = await new comment({
      author: User._id,
      content: content,
      article: articles._id,
    });
    const newComments = await newComment.save();
    await articles.comment_id.push(newComments);
    await articles.save();
    res.redirect(`/users/post-details/${articles._id}`);
  } catch (error) {
    console.log(error);
  }
};

exports.setting = async (req, res, next) => {
  const { full_name, age, phone_number, sex, email, dob, address, quoctich } = req.body;
  const newUser = {};

  if (full_name) newUser.full_name = full_name;
  if (age) newUser.age = age;
  if (phone_number) newUser.phone_number = phone_number;
  if (sex) newUser.sex = sex;
  if (email) newUser.email = email;
  if (dob) newUser.dob = dob;
  if (address) newUser.address = address;
  if (req.file) {
    const image = req.file.filename;
    newUser.avatar = image;
  }

  try {
    const UserAcc1 = await account.findOne({ _id: req.session.userId });
    await users.findOneAndUpdate(
      { account_id: UserAcc1._id },
      { $set: newUser }
    );
    const msg1 = "Update Information Success !";
    return res.redirect(`/users/setting?msg1=${msg1}`);
  } catch (err) {
    console.log(err);
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
            return res.redirect(`/users/setting?msg=${msg}`);
          } else if (newPassword.length < 4) {
            const errorPassword = "Password must be at least 4 characters !!!";
            return res.redirect(`/users/setting?msg=${errorPassword}`);
          } else if (newPassword != newPassword2) {
            const msg = "Confirm password wrong !";
            return res.redirect(`/users/setting?msg=${msg}`);
          } else {
            await account.findOneAndUpdate(
              { _id: user._id },
              { $set: changePassword },
              { new: true }
            );
            const msg = "Change Password Success !";
            return res.redirect(`/users/setting?msg=${msg}`);
          }
        } else {
          const msg = "Wrong Current Password !";
          return res.redirect(`/users/setting?msg=${msg}`);
        }
      });
    }
  });
};
exports.getSetting = async (req, res, next) => {
  const { msg, msg1 } = req.query;
  try {
    const acc = await account.findOne({ _id: req.session.userId }).exec();

    const user = await users.findOne({ account_id: acc._id }).exec();

    return res.render("users/setting", {
      err: msg,
      err1: msg1,
      user: user,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.unBookmark = async (req, res, next) => {
  const { _id } = req.body;
  const article_id = req.params.id;
  try {
    const unBookmark = await bookmarks.findOneAndRemove({ _id: _id });
    if(unBookmark){
    const abc = await users.findOneAndUpdate(
      { bookmarks_id: unBookmark._id },
      { $pull: { bookmarks_id: unBookmark._id } }
    );
    };
    return res.redirect(`/users/post-details/${unBookmark.article_id}`);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  const { _id } = req.body;
  try {
    const user = await users.findOne({ account_id: req.session.userId });
    const deleteComment = await comment.findOneAndRemove({
      _id: _id,
      author: user._id,
    });
    const details = await article.findOneAndUpdate(
      { comment_id: deleteComment._id },
      { $pull: { comment_id: deleteComment._id } }
    );

    return res.redirect(`/users/post-details/${deleteComment.article}`);
  } catch (error) {
    console.log(error);
  }
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

    return res.render("users/blog", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      user:user,
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
    return res.render("users/category", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      user:user,
      find: findCategory,
      article1: articles1,
      article: articles,
      category: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

