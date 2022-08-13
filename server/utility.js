const signupModal = require("./models/signupModal");
const bcrypt =require("bcryptjs");

const isExistingUser = async (email) => {
    let existinguser = false
    await signupModal.find({ email: email }).then((userData) => {
        if (userData.length) {
            existinguser = true
        }
    })
    return existinguser
};

const generateHash = (password) => {
    
    const salt = 10;
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(salt).then((saltHash) => {
         
            bcrypt.hash(password, saltHash).then((passwordHash) => {
               
                resolve(passwordHash)
            })
        })


    })

}
module.exports = { isExistingUser, generateHash }