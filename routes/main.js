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
    res.render('new', { title: 'New'});
});
