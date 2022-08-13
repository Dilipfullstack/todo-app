const mongoose = require('mongoose');

const toDoSchema = mongoose.Schema({
    username: String,
    activity: String,
    status: String,
    timeTaken: String,
    action: String
})

const ToDoModel = mongoose.model("toDoList", toDoSchema);

module.exports = ToDoModel;