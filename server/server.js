const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const config = require('./config/config');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// Add a todo

app.post('/todos', authenticate, (req,res) => {
	var todo = new Todo ({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});

	// console.log(req.body);
});


// Get all of the todos

app.get('/todos', authenticate, (req,res) => {

	Todo.find({_creator: req.user._id}).then((todos)=> {
		// send an a array inside an object its possible to send another
		// with the array
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});
});

// GET /todos/1234232

app.get('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;

	// Valid id using isValid
	if(!ObjectID.isValid(id)) return res.status(404).send();

	// findByID
	Todo.findOne({
		_id: id,
		_creator: req.user._id
		}).then((todo) => {
		if(!todo) res.status(404).send();

		res.send({todo});

	}).catch((e) => {
		res.status(400).send();
	})
});

app.delete('/todos/:id', authenticate, (req,res) => {
	// get the id
	var id = req.params.id;

	// validate the id -> not valid? return 404

	if(!ObjectID.isValid(id)) return res.status(404).send();

	// remove todo by id
	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {

		if(!todo) res.status(404).send();

		res.send({todo});

	}).catch((e) => res.status(400).send());

});

app.patch('/todos/:id', authenticate, (req, res) =>{
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']); // subset of things that user passes to server

	if(!ObjectID.isValid(id)) return res.status(404).send();

	if(_.isBoolean(body.completed) && body.completed){
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({
		_id: id, 
		_creator: req.user._id
		},
		{$set: body}, 
		{new: true}
	).then((todo) => {

		if(!todo) return res.status(404).send();

		res.send({todo});

	}).catch((e) => res.status(400).send());

});

// POST /users 
app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	// User.findByToken
	

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	});
});


// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send();
	});

});

app.delete('/users/me/token', authenticate, (req,res)=> {
	req.user.removeToken(req.token).then(() =>{
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});   
});


app.listen(port, () => {
	console.log(`Started at port ${port}`);
});

module.exports = {app};