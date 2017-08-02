const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user')


// Todo.remove({}).then((result) => {
// 	console.log(result);
// });

// Todo.findOneandRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({_id: '5981d162ee22d07d3569df10'}).then((todo) => {});

// Todo.findByIdAndRemove('5981d162ee22d07d3569df10').then((todo) => {
// 	console.log(todo);
// });