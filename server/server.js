var express = require('express');
var bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());
const port = process.env.PORT || 3000;

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

// GET /todos/1234232
app.get('/todos/:id', (req, res) => {
	var id = req.params.id;

	// Valid id using isValid
	if(!ObjectID.isValid(id)) return res.status(404).send();

	// findByID
	Todo.findById(id).then((todo) => {
		if(!todo) res.status(404).send();

		res.send({todo});

	}).catch((e) => {
		res.status(400).send();
	})
});

app.listen(port, () => {
	console.log(`Started at port ${port}`);
});

module.exports = {app};