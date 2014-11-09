Express4 CRUD demo
============

Crud Example with Express 4

## Setup

Install yeoman and express generator
```bash
$ sudo npm install -g yo generator-express bower grunt-cli
```

Generate a new express site, choosing Basic, Jade and Grunt
```bash
$ mkdir crudtest && cd crudtest
$ yo express
[?] Select a version to install: (Use arrow keys)
‣ Basic 
  MVC 
[?] Select a view engine to use: (Use arrow keys)
‣ Jade 
  EJS 

```

A folder structure will be automatically generated:

```bash
$ tree -L 1
.
├── app.js
├── bin
├── bower.json
├── Gruntfile.js
├── LICENSE
├── node_modules
├── package.json
├── public
├── README.md
├── routes
└── views

```

Start the server and browse http://localhost:3000/ to check it's working:
```bash
$ npm start

> express4crud@0.0.1 start /var/www/express4crud
> node ./bin/www

GET / 200 254.744 ms - 305
GET /css/style.css 200 4.750 ms - 111
GET /favicon.ico 404 29.664 ms - 1173
```
 You'll need to have mongoDB installed in order to continue with this tutorial. Please check that you have it up and running before continuing.
 
 ```bash
$ mongo
MongoDB shell version: 2.4.11
connecting to: test
>
```
 

## Adding Models

Installing up mongoose
```bash
$ npm install --save mongoose
```
After that go ahead and modify `app.js`, add the following lines to set the database connection.

```javascript
 var routes = require('./routes/index');
 var users = require('./routes/user');
 
+var mongoose = require('mongoose');
+
+mongoose.connect('mongodb://localhost/crudtest');
+
 var app = express();

```
