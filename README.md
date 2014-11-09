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

We are going to create a folder to store our models:
```bash
$ mkdir models
```

Our first model will look like this `models/persons.js`:
```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var personSchema = new Schema({
    name: String,
    age: Number
});

var personModel = mongoose.model('Persons', personSchema);

module.exports = personModel;

```
 As you can see it's a very simple model, we can create a test file to prove it works:
 
 ```bash
$ mkdir test
```

Just to create a simple test we can create a file called: `test/persons-tests.js` with this content:

```javascript
var Person = require('../models/persons');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/crudtest');

var p = new Person({ name:"Cristian", age:27 });
p.save(function(err, doc){
    console.log(err, doc);    
});

```

If we run it we should be able to see the following
```bash
$ node test/persons-tests.js 
null { __v: 0,
  name: 'Cristian',
  age: 27,
  _id: 545ed9517520ef9e153a877e }
^C
```

To validate this we can inspect our Mongo Database directly by doing:

```bash
$ mongo
MongoDB shell version: 2.4.11
connecting to: test
> show dbs;
crudtest	0.203125GB
test	0.203125GB
local	0.078125GB
> use crudtest
switched to db crudtest
> show collections
persons
system.indexes
> db.persons.find()
{ "name" : "Cristian", "age" : 27, "_id" : ObjectId("545ed9517520ef9e153a877e"), "__v" : 0 }
> ^C
bye

```

## Modifying Routes

We are going to create a new file `routes/main.js` and we are going to include it in our `app.js` file. Right after the express config:

```javascript
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

+require('./routes/main.js');
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
```

Now we are going to create a new page to list our persons, in `routes/main.js`:
```javascript
var app = module.parent.exports.app;

app.get('/list', function(req, res){
    res.end('It works!');
});
```

Let's reset the web server and test the new route http://localhost:3000/list


