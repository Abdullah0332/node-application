# node-application
A complete Node JS application using Express, EJS, MongoDB.

# Getting Start

- To get the Node server running locally:

    npm init :  set up a new or existing npm package
- After initializing the npm package we intall the following 

    express, mongoose, mongoDB, nodemon, express-session, express-validator, helmet, multer, compression, pdfkit, ejs, csurf, connect-flash, bcryptjs, morgan, nodemailer, nodemailer-sendgrid-transport
We install them by using the following command 

  ```npm install --save  express mongoose mongoDB nodemon express-session express-validator helmet multer compression pdfkit ejs csurf connect-flash, bcryptjs morgan nodemailer nodemailer-sendgrid-transport```

- Install MongoDB Community Edition and MongoDB Compass.

# nodemon.js

First create a cluster in MongoDb and then create a user after creating a user copy the following thing from cluter and write them in nodemon.js file:

  - MONGO_USER : MongoDB user name,
  - MONGO_PASSWORD : Password of your user,
  - MONGO_DATABASE : Name of your Database

Go to Stripe create a user and copy the stripe key and paste it here in same file: 

  - MONGO_STRIPE_KEY : Stripe security key
        
# Run Application

- The code is run by ```npm start```


# Application Structure

- ```app.js``` - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also requires the routes and models we'll be using in the application.
- ```routes/``` - This folder contains the route.
- ```models/``` - This folder contains the schema definitions for our Mongoose models.
- ```views/``` - This folder conatin all the EJS files(Pages) that are render.
- ```controller/``` - get the requested data from the models, render the page from views and return it to the user to view in the browser.
- ```public/``` - This folder contain all CSS files.
- ```util/``` - This folder contain ```path.js``` file and ```file.js``` that are used to delete file.
- ```middleware/``` - This folder check the authentication of user.
- ```data/``` - It contain the Invoices.
- ```images/``` - Its contain all pictures of products.
