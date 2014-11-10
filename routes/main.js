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

app.get('/p/delete/:id', function(req, res){
    Persons.remove({ _id: req.params.id }, function(err, doc){
        if(!err){
            res.redirect('/list');
        } else {
            res.end(err);    
        }    
    });
});

