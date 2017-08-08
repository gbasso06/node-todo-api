const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
	_id: userOneId,
	email: 'ana@furacao2000.com.br',
	password: 'userOnePassword!',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, 'somesecret').toString()
	}]
}, {
	_id: userTwoId,
	email: 'adriana@furacao2000.com.br',
	password: 'userTwoPassword!'
}]

const todos = [	{
	_id : new ObjectID(),
	text: 'Fist test todo'
	},{
	_id : new ObjectID(),
	text: 'Second test todo',
	completed: true,
	completedAt: 333
}];


const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done());
}

const populateUsers = (done) => {
	// Wipe all users in the database
	User.remove({}).then(()=>{
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		return Promise.all([userOne, userTwo]);
	}).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};