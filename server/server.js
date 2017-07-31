var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

// Add a todo

app.post('/todos', (req,res) => {
	var todo = new Todo ({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});

	// console.log(req.body);
});


// Get all of the todos

app.get('/todos', (req,res) => {

	Todo.find().then((todos)=> {
		// send an a array inside an object its possible to send another
		// with the array
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});


});

app.listen(3000, () => {
	console.log(`Started on port 3000`);
});

module.exports = {app};