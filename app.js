// const http= require('http');
// const router=require('./route');
const path=require('path');
const express=require('express');
const bodyparser=require('body-parser');
const session=require('express-session');
const MongodbStore=require('connect-mongodb-session')(session);
const auth = require('./middleware/isAuth');
const productsController = require('./controller/shop');
const helmet=require('helmet');
const compression=require('compression');
const fs=require('fs');
const morgan=require('morgan');

// const mongoConnect=require('./util/database').mongoConnect;
const mongoose=require('mongoose');
const User=require('./models/user');
const csrf=require('csurf');
const flash=require('connect-flash');
const multer=require('multer')
// const hbsEngine=require('express-handlebars');
const app=express();

const MONGODB_URI=
`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-qlsts.mongodb.net/${process.env.MONGO_DATABASE}`


const store=new MongodbStore({
    uri:MONGODB_URI,
    collection:'session'
});

const csurfprotection = csrf();
// app.engine('hbs',hbsEngine({layoutsDir:'views/layouts/', defaultLayout:'main-layout', extname:'hbs'}));
app.set('view engine','ejs');
app.set('views','views');


const fileStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null , 'images')
  },
  filename: (req,file,cb)=>{
    cb(null, file.filename + '-' + file.originalname )
  }
})

const fileFilter= (req,file,cb)=>{
  if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg'){
    cb(null , true);
  }else{
    cb( null , false);
  }
}



app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));

app.use(multer({storage: fileStorage, fileFilter:fileFilter}).single('image'))

app.use('/images', express.static(path.join(__dirname,'images')));
app.use(session({secret:'my secret',resave: false,saveUninitialized:false,store:store}))

app.use(flash());


// db.execute('SELECT * FROM products')
// .then(result => {
//     console.log(result[0],result[1]);
// })
// .catch(err => {
//     console.log(err);
// });
app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if(!user){
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => 
        // console.log(err)
        {
          throw new Error(err)
        }
        );
  });


const adminData=require('./routes/admin');
const shoproutes=require('./routes/shop');
const authroutes=require('./routes/auth');

app.post('/order', auth,  productsController.postorder);

const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),{flags: 'a'})

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream: accessLogStream}));


app.use(csurfprotection);
app.use((req,res,next)=>{
  // res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken=req.csrfToken();
  next();
})

const errorcontroller= require('./controller/error')

app.use('/admin',adminData);
app.use(shoproutes);
app.use(authroutes);

app.use('/404', errorcontroller.get404);
app.use('/505', errorcontroller.get505);
app.use((error, req, res, next)=>{
  console.log(error)
  res.redirect('/505')
});
// const server=http.createServer(app);

// server.listen(8080);

// mongoConnect((client)=>{
//     console.log(client);
//     app.listen(8080);
// })      
// console.log(process.env.NODE_ENV)
mongoose.connect(
    MONGODB_URI
)
.then(result=>{
    app.listen(process.env.PORT || 8080);
})
.catch(err=>console.log(err))