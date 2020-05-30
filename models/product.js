const mongoose= require('mongoose');

const Schema= mongoose.Schema;

const productSchema= new Schema({
    title:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    description:{
        type:  String,
        required: true
    },
    imgUrl:{
        type: String,
        required: true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
});

module.exports=mongoose.model('Product',productSchema);




// -----------------------------------------------------

// MongoDB 

// const cart=require('./cart')
// const getDb=require('../util/database').getDb;
// const mongodb=require('mongodb');


// class Product {
//   constructor(title, price, description, imgurl,id, userId) { 
//     this.title = title;
//     this.imgurl=imgurl;
//     this.price=price;
//     this.description=description; 
//     this._id=id ? new mongodb.ObjectId(id) : null; 
//     this.userId=userId;
//   }

//   save(){
//     const db=getDb();
//     let dbOp;
//     if(this._id){
//       dbOp=db.collection('products')
//       .updateOne({_id: this._id},{$set:this});
//     }else{
//       dbOp=db.collection('products').insertOne(this);
      
//     }
//     return dbOp.then(result=>{
//       console.log(result)
//     }) 
//     .catch(err=>console.log(err))
//   }

//   static fetchAll(){
//   const db=getDb();
//   return db
//   .collection('products')
//   .find()
//   .toArray()
//   .then(product=>{
//     console.log(product);
//     return product;
//   })
//   .catch(err=>console.log(err))
//   }
//   static findById(prodId){
//     const db=getDb();
//     return db.collection('products')
//     .find({_id: new mongodb.ObjectId(prodId)})
//     .next()
//     .then(product=>{
//       console.log(product);
//       return product;
//     })
//     .catch(err=>console.log(err))
//   }

//   static deletebyId(prodId){
//     const db=getDb();
//     return db.collection('products')
//     .deleteOne({_id: new mongodb.ObjectId(prodId)})
//     .then(result=>{
//       console.log(result);
//     })
//     .catch(err=>console.log(err))
//   }

// };
// module.exports=Product;

// ----------------------------
// SQL
//   save() {
//     return db.execute(
//       'INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)',
//       [this.title, this.price, this.description, this.imgurl]
//     );
//   }
//   static fetchAll(){
//     return db.execute('select * from products')
//   }

//   static deletebyId(id){

//   }

//   static findById(id){
//     return db.execute('select * from products where products.id = ?',[id]);
//   }
// }


// ______________________________


// const fs = require('fs');
// const path = require('path');
// const cart=require('./cart')

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'products.json'
// );

// const getProductsFromFile = cb => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

// module.exports = class Product {
//   constructor(id,title, imgurl, price, description) {
//     this.id=id;
//     this.title = title;
//     this.imgurl=imgurl;
//     this.price=price;
//     this.description=description; 
//   }

//   save() {
//     getProductsFromFile(products => {
//     if(this.id){
//       const existingproductindex=products.findIndex(
//         prod=> prod.id===this.id
//         );
//       const updatedproduct=[...products];
//       updatedproduct[existingproductindex]=this;
//       fs.writeFile(p, JSON.stringify(updatedproduct), err => {
//         console.log(err);
//       });
//     }else{
//     this.id=Math.random().toString();
//       products.push(this);
//       fs.writeFile(p, JSON.stringify(products), err => {
//         console.log(err);
//       });
//     }
//     });
//   }

//   static deletebyId(id){
//     getProductsFromFile(products=>{
//       const product =products.find(p=> p.id===id);
//       const updatedproducts = products.filter(prod => prod.id !== id);
//       fs.writeFile(p, JSON.stringify(updatedproducts), err => {
//         if(!err){
//           cart.deleteproduct(id, product.price);
//         }
//       });
      
//     });
//   }

//   static fetchAll(cb) {
//     getProductsFromFile(cb);
//   }
  
//   static findById(id,cb){
//     getProductsFromFile(products=>{
//       const product =products.find(p=> p.id===id);
//       cb(product);
//     })
//   }
// };
