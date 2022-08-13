const mongoose = require("mongoose")

const signupschema = new mongoose.Schema({
    email: {
        type: String,

        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})

const signupModal = mongoose.model("signup", signupschema);

module.exports = signupModal