var Person = require('../models/persons');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/crudtest');

describe('Persons tests', function() {

  it('Debe crear una persona', function() {
    var p = new Person({ name:"Cristian", age:27 });
    p.save(function(err, doc){
      console.log(err, doc);
    });
  });

});
