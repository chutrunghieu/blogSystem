const account = require("../models/accountM");
const article = require("../models/articleM");
const category = require("../models/categoryM");
const comment = require("../models/commentM");
const users = require("../models/usersM");

exports.postDetails = async (req, res, next) => {
  const _id = req.params.id;
  try {
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
      .limit(5)
      .exec();
    return res.render("post-details", {
      category: categories,
      article: articles,
      article1: articles1,
      comment: comments,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.homePage = async (req, res, next) => {
  try {
    const categories = await category.find({}).exec();
    const articles = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ views: -1 })
      .limit(5)
      .exec();
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5)
      .exec();
    const comments = await comment.find({}).exec();

    return res.render("index", {
      category: categories,
      article: articles,
      article1: articles1,
      comment: comments,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.contact = (req, res, next) => {
  res.render("contact");
};

exports.blog = async (req, res, next) => {
  const perPage = 4;
  var page = req.query.page || 1;
  try {
    const categories = await category.find({});
    const count = await article.countDocuments();
    const articles = await article
      .find({ status: "publish" })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate([{ path: "category_name" }, { path: "author" }]);
    const articles1 = await article
      .find({ status: "publish" })
      .populate([{ path: "category_name" }, { path: "author" }])
      .sort({ write_date: -1 })
      .limit(5);
    const comments = await comment.find({});

    return res.render("blog", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      category: categories,
      article: articles,
      article1: articles1,
      comment: comments,
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
    return res.render("category", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      find: findCategory,
      article1: articles1,
      article: articles,
      category: categories,
    });
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

    return res.render("blog", {
      pagination: {
        page: page,
        pageCount: Math.ceil(count / perPage),
      },
      article1: articles,
      category: categories,
      article: searchArticle,
      search,
    });
  } catch (error) {
    console.log(error);
  }
};
