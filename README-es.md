Express 4.x CRUD
============
Guia paso a paso para crear un ABM con Express 4 y mongoose.

## Setup

Instalando yeoman, express generator y otras utilidades
```bash
$ sudo npm install -g yo generator-express bower grunt-cli
```

Generemos un sitio basico con express, eligiendo las opciones Basic, Jade y Grunt...
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

Luego de completado el proceso una estructura de carpetas muy similar a esta debio haberse generado:

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

Arranquemos el server y abramos las siguiente url [http://localhost:3000/](http://localhost:3000/) para saber si esta funcionando:
```bash
$ npm start

> express4crud@0.0.1 start /var/www/express4crud
> node ./bin/www

GET / 200 254.744 ms - 305
GET /css/style.css 200 4.750 ms - 111
GET /favicon.ico 404 29.664 ms - 1173
```
![Express 4](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/site-express4.png)

 Para poder realizar este tutorial es necesario tener instalado mongoDB. Por favor, revisa que mongo esta disponible:
 
 ```bash
$ mongo
MongoDB shell version: 2.4.11
connecting to: test
>
```
 

## Adding Models

Instalando mongoose
```bash
$ npm install --save mongoose
```
Una vez finalizada la instalción modifiquemos `app.js`, agregando estas lineas para poder conectarnos a la base de datos desde nuestra applicacion express.

```javascript
 var routes = require('./routes/index');
 var users = require('./routes/user');
 
+var mongoose = require('mongoose');
+
+mongoose.connect('mongodb://localhost/crudtest');
+
 var app = express();

```

Creamos una carpeta para alojar los modelos.
```bash
$ mkdir models
```

Nuestro primer modelo `models/persons.js` deberia verse así:
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

Como podras ver es un modelo bastante siemplre, podemos crear un archivo test para comprobar como funciona:
 
 ```bash
$ mkdir test
```

Creamos entonces un caso de prueba dentro de un archivo llamado: `test/persons-tests.js` con el siguiente contenido:

```javascript
var Person = require('../models/persons');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/crudtest');

var p = new Person({ name:"Cristian", age:27 });
p.save(function(err, doc){
    console.log(err, doc);    
});

```

Si lo ejecutamos, deberiamos poder ver lo siguiente:
```bash
$ node test/persons-tests.js 
null { __v: 0,
  name: 'Cristian',
  age: 27,
  _id: 545ed9517520ef9e153a877e }
^C
```

Para validar esto, podemos inspeciona nuestra Base de Datos Mongo desde consola, ingresando los siguientes comandos:

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

## Modificando las Rutas

Vamos a crear un arhivo nuevo `routes/main.js` y vamos a llamarlo (incluirlo) desde nuestro archivo `app.js`. Justo después de que termina la configuración de express:

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

Como vemos estamos generando una relación padre -> hijo entre los 2 archivos `app.js` -> `routes/main.js`. Para ganar acceso a las variables del archivo padre desde el hijo, necesitamos hacer el siguiente cambio en `app.js`:

```javascript
mongoose.connect('mongodb://localhost/crudtest');

+var app = exports.app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

```
Entonces las relación se conforma asi:

| Archivo Padre | Archivo incluido (hijo) |
| ---- | ---- |
| app.js | routes/main.js |
| exports.app | module.parent.exports.app |

Ahora vamos a crear una nueva página para listar a las personas, en `routes/main.js`:
```javascript
var app = module.parent.exports.app;

app.get('/list', function(req, res){
    res.end('It works!');
});
```

Reiniciemos el servidor web y probemos la nueva ruta [http://localhost:3000/list](http://localhost:3000/list)

![List Route](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/route-list-test.png)

Ahora incluyamos los modelos en nuestro `routes/main.js`, observa los siguientes cambios:
```javascript
 var app = module.parent.exports.app;
+var Persons = require('../models/persons.js');
 
 app.get('/list', function(req, res){
-    res.end('It works!');
+    Persons.find({}, function(err, docs){
+        res.json(docs);
+    });
});
```
Nota que `Query#find([criteria], [callback])` es una funcionalidad predefinida que se hereda de la [API de Mongoose](http://mongoosejs.com/docs/api.html#query_Query-find).

Reinicia nuevamente el server y ve a [http://localhost:3000/list](http://localhost:3000/list):
![List JSON example](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/list-json.png)

## Creando una vista

Cambiemos un poco la funcionalidad para mostrar una tabla HTML en vez de una respuesta plana en JSON. Primero creamos una nueva template llamada `views/list.jade` basándonos en una pre-existente.
```bash
$ cp views/index.jade views/list.jade
```
Ahora unamos esa vista a nuestra definicion de ruta:

```javascript
var app = module.parent.exports.app;
var Persons = require('../models/persons.js');

app.get('/list', function(req, res){
    Persons.find({}, function(err, docs){
-        res.json(docs);
+        res.render('list', { title: 'List', persons: docs});
    });
});
```
Si reiniciamos el server nuevamente, deberiamos poder ver lo siguiente:

![List View](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/list-view.png)

Nota que estamos pasando a la vista un objeto con las lista de `persons`. Modifiquemos nuestro archivo vista `views/list.jade` para mostrar la informacion en forma de tabla:

```jade
extends layout

block content
  h1= title
  p=JSON.stringify(persons)
  p
    a(href="/p/new") New
  table
    tr
      th N
      th Name
      th Age
      th Options
    - persons.forEach(function(v,i){
    tr
      td=i
      td=v.name
      td #{v.age} years
      td
        a(href="/p/edit/"+v._id) Edit
        | 
        a(href="/p/delete/"+v._id) Delete
    - });
```

![List View Table](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/list-view-table.png)

Nota que agregamos los links para completar las secciones de crear nuevo, editar y borrar.

## Insertando un registro

Continuemos con las creación de una persona:

```bash
$ cp views/index.jade views/new.jade
```

Agreguemos la ruta para llamar a la nueva vista. En `routes/main.js`:

```javascript
var app = module.parent.exports.app;
var Persons = require('../models/persons.js');

app.get('/list', function(req, res){
    Persons.find({}, function(err, docs){
        res.render('list', { title: 'List', persons: docs});
    });
});
+
+app.get('/p/new', function(req, res){
+    res.render('new', { title: 'New'});
+});

```

Y finalmente cambiamos la vista `views/new.jade`:
```jade
extends layout

block content
  h1= title
  form(action='',method='post')
    div
      label(for='name') Name:
      input(type='text', name='name', id='name', placeholder='Name here...')
    div
      label(for='age') Age:
      input(type='text', name='age', id='age', placeholder='Age...')
    div
      input(type='submit', value='Save')
  style.
    form label { min-width: 80px; display: inline-block; }
    form > div { padding: 5px; }
```

Deberia verse asi:

![New View](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/new-view.png)

A este punto sólo creamos la url por GET para mostrar el formulario, ahora necesitamos definir la misma url por POST para recibir los parametros cada vez que el usuario submita el formulario.

Modificamos entonces `routes/main.js`:

```javascript
var app = module.parent.exports.app;
var Persons = require('../models/persons.js');

app.get('/list', function(req, res){
    Persons.find({}, function(err, docs){
        res.render('list', { title: 'List', persons: docs});
    });
});

app.get('/p/new', function(req, res){
    res.render('new', { title: 'New'});
});

 app.post('/p/new', function(req, res){
-    res.render('new', { title: 'New'});
+    console.log(req.body);
+    var p = new Persons({ name: req.body.name, age: req.body.age });
+    p.save(function(err, doc){
+        if(!err){
+            res.redirect('/list');
+        } else {
+            res.end(err);    
+        }    
+    });
 });
```


Vamos a [http://localhost:3000/p/new](http://localhost:3000/p/new) y submitimos una nueva persona:

![New Perrson Submit](https://github.com/cortezcristian/express4crud/blob/master/pics/save-first-record.png)

```bash
$ npm start

> express4crud@0.0.1 start /var/www/express4crud
> node ./bin/www

GET /p/new 200 254.582 ms - 662
GET /css/style.css 200 7.502 ms - 111
{ name: 'John', age: '22' }
POST /p/new 302 411.564 ms - 66
GET /list 200 286.316 ms - 978
GET /css/style.css 200 20.991 ms - 111
```

Si todo marcha bien, deberias ser redirigido a `/list`:

![List View New](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/list-view-new.png)

## Borrando un registro
Recuerda que para borrar un registro previamente creamos un link que pasa el ObjectId del documento como parametro en la url `/p/delete/:id`. Modifiquemos nuestro archivo de rutas `routes/main.js` para agregar la url de borrado. 

```javascript
var app = module.parent.exports.app;
var Persons = require('../models/persons.js');

app.get('/list', function(req, res){
    Persons.find({}, function(err, docs){
        res.render('list', { title: 'List', persons: docs});
    });
});

app.get('/p/new', function(req, res){
    res.render('new', { title: 'New'});
});

app.post('/p/new', function(req, res){
    console.log(req.body);
    var p = new Persons({ name: req.body.name, age: req.body.age });
    p.save(function(err, doc){
        if(!err){
            res.redirect('/list');
        } else {
            res.end(err);    
        }    
    });
});
+
+app.get('/p/delete/:id', function(req, res){
+    Persons.remove({ _id: req.params.id }, function(err, doc){
+        if(!err){
+            res.redirect('/list');
+        } else {
+            res.end(err);    
+        }    
+    });
+});
```
Si seguimos adelante y borramos el registro que creamos con antelación, y prestamos atencion a la consola veremos lo siguiente:

```bash
$ npm start

> express4crud@0.0.1 start /var/www/express4crud
> node ./bin/www

GET /list 200 545.345 ms - 581
GET /p/delete/5460d48969d6ee103e4f8c56 302 213.596 ms - 66
GET /list 200 545.345 ms - 581
GET /css/style.css 200 6.062 ms - 111
```

Si todo va bien la aplicación deberia redirigirte a `/list`:

![List View Deleted](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/list-view-deleted.png)

Nos fijamos que en mi ejemplo el registro correspondiente a la persona John ya no existe mas.

## Editando un registro
Editar un registro va a tener un poco mas de complejidad. Arranquemos por crear la vista para el formulario de edición.

```bash
$ cp views/new.jade views/edit.jade
```

Creamos una nueva ruta, para encontrar un documento en base a su ObjectId en `./routes/main.js`:

```javascript

app.get('/p/edit/:id', function(req, res){
    Persons.findOne({ _id: req.params.id }, function(err, doc){
        if(!err){
            res.render('edit', { title: 'Edit', person: doc});
        } else {
            res.end(err);    
        }    
    });
});

```

Ahora modifiquemos la vista `views/edit.jade` para mostrar estos valores obtenidos:

```jade
extends layout

block content
  h1= title
  p=JSON.stringify(person)
  form(action='',method='post')
    div
      label(for='name') Name:
      input(type='text', name='name', id='name', placeholder='Name here...', value=person.name)
    div
      label(for='age') Age:
      input(type='text', name='age', id='age', placeholder='Age...', value=person.age)
    div
      input(type='submit', value='Save')
  style.
    form label { min-width: 80px; display: inline-block; }
    form > div { padding: 5px; }

```

En este punto la vista de Edición deberia verse asi:

![Edit View](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/edit-view.png)

Todavia necesitamos definir la url por POST para poder modificar y persistir los nuevos datos de la persona en `./routes/main.js`. Solamente agregamos estas lineas.

```javascript
app.post('/p/edit/:id', function(req, res){
    Persons.findOne({ _id: req.params.id }, function(err, doc){
        if(!err){
            doc.name = req.body.name; 
            doc.age = req.body.age;
            doc.save(function(err, doc){
                if(!err){
                    res.redirect('/list');
                } else {
                    res.end(err);    
                }    
            }); 
        } else {
            res.end(err);    
        }    
    });
});

```

Ahora editemos nuestro documento para incrementar la edad de 27 a 28:

![Edit Age](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/view-edit-age.png)

Si todo funciona bien deberias ser redirigido a `/list`:

![List View Edited](https://raw.githubusercontent.com/cortezcristian/express4crud/master/pics/list-view-edited.png)

Nota que ahora nuestro registro dice 28 en vez de 27.

## Final 
Si quiere acceder al fuente completo de esta demo, podes clonarte el repo.
