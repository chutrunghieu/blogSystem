var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require("method-override");
var session = require("express-session");
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
var paginate = require('handlebars-paginate');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require('fs');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountRouter = require('./routes/account');
var adminRouter = require('./routes/admin');

var app = express();

//connect database
var mongoose = require("mongoose");
const url= "mongodb+srv://acevip123:acevip123@ace.vg8sz.mongodb.net/ace?retryWrites=true&w=majority"
mongoose.Promise = global.Promise;
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
  })
  .then(() => console.log("Connecting to DB ...."))
  .catch((err) => console.log(`Connect to Db failed. Error: ${err}`));

//using Session to verify

Handlebars.registerHelper('equals', function (a, b, options) {
  if (a == b) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});

Handlebars.registerHelper('paginate', paginate);


app.engine(
  'hbs',
    exphbs({
      defaultLayout: 'layout',
      handlebars: allowInsecurePrototypeAccess(Handlebars),
      extname: '.hbs',
      helpers: require('handlebars-helpers')(),
  }),
);

app.use(
  session({
    secret: "mySecretSession",
    resave: true,
    saveUninitialized: false,
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  methodOverride((req, res) => {
  if (req.body && typeof req.body === "object" && "_method" in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
})
);
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.post('/upload',multipartMiddleware,(req,res)=>{
  try {
      fs.readFile(req.files.upload.path, function (err, data) {
          var newPath = __dirname + '/public/images/' + req.files.upload.name;
          fs.writeFile(newPath, data, function (err) {
              if (err) console.log({err: err});
              else {
                  console.log(req.files.upload.originalFilename);
               
                  let fileName = req.files.upload.name;
                  let url = '/images/'+fileName;                    
                  let msg = 'Upload successfully';
                  let funcNum = req.query.CKEditorFuncNum;
                  console.log({url,msg,funcNum});
                 
                  res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('"+funcNum+"','"+url+"','"+msg+"');</script>");
              }
          });
      });
     } catch (error) {
         console.log(error.message);
     }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account', accountRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
