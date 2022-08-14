const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require("bcryptjs");
const signupModal = require("./models/signupModal");
const { isExistingUser, generateHash } = require("./utility");
const jwt = require('jsonwebtoken');
const toDoModel = require('./models/toDoModel');

// Setting environment vairable
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}
app.use(cors(corsOptions));
app.use(cors());

// Mongoose connect
const mongoDB = 'mongodb+srv://Dilip:imageupload123@cluster0.krtlwb0.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoDB, () => {
    console.log('DB Connected')
})

app.post("/signup", async (req, res) => {
    if (await isExistingUser(req.body.email)) {
        res.status(200).send("User Already Exist")
    } else {
        generateHash(req.body.password).then((passwordHash) => {
            signupModal.create({ email: req.body.email, password:passwordHash }).then((data) => {
                res.status(200).send("User Added Sucessfully")
            }).catch((err) => {
                res.status(400).send(err.message)
            })

        })
    }
});

app.post('/login', (req, res) => {
    signupModal.find({email: req.body.email}).then((userInfo) => {
        if(userInfo.length) {
            bcrypt.compare(req.body.password, userInfo[0].password).then((isMatched) => {
                if(isMatched) {
                    const authToken = jwt.sign(userInfo[0].email, process.env.SECRET_KEY);
                    res.status(200).send({authToken})
                } else {
                    res.status(400).send("Incorrect Password");
                }
            }).catch((err) => {
                console.log(err)
            })
        } else {
            res.status(400).send("User doesn't exists. Please sign up!")
        }
    })
});

app.post('/addactivity', (req, res) => {
    // toDoModel.create({
    //     activity: req.body.activity,
    //     status: req.body.status,
    //     timeTaken: req.body.timeTaken,
    //     action: req.body.action
    // }).then(() => {
    //     res.status(200).send('Activity Added')
    // }).catch(err => {
    //     console.log(err);
    // })

    if(req.headers.authorization) {
        try {
            const user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
            console.log(user)
            toDoModel.create({
                username: user,
                activity: req.body.activity,
                status: req.body.status,
                timeTaken: req.body.timeTaken,
                action: req.body.action,
                startTime: "",
                endTime: ""
            }).then(() => {
                res.status(200).send('Activity Added')
            }).catch(err => {
                console.log(err);
            })
        }
        catch(err) {
            res.status(500).send('Authorization Failed')
        }
    } else {
        res.status(200).send('Authkey not found')
    }
});

app.get('/activity', (req, res) => {
    if(req.headers.authorization) {
        try {
            const user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
            // console.log(user)
            signupModal.find({email: user}).then((userInfo) => {
                if(userInfo.length) {
                    toDoModel.find({username: user}).then((activityInfo) => {
                        const activity = activityInfo.reverse();
                        res.status(200).send(activity)
                    })
                } else {
                    res.status(403).send('User Does not exists. Please Sign Up!')
                }
            }).catch(err => {
                console.log(err);
            })
        }
        catch(err) {
            res.status(500).send('Authorization Failed')
        }
    } else {
        res.status(200).send('Authkey not found')
    }
});

app.put('/addstarttime/:id', async (req, res) => {
    const startTime = new Date().getTime();
    console.log(startTime)
    await toDoModel.findByIdAndUpdate(req.params.id, {startTime: startTime, status: "Pending"}, (err, docs) => {
        if(err) {
            console.log(err);
        }
        else {
            console.log("Updated :", docs)
            res.status(200).send('Data Updated')
        }
    })
})

app.put('/addendtime/:id', async (req, res) => {
    try {
        const endTime = new Date().getTime();
        console.log(endTime)
        await toDoModel.findByIdAndUpdate(req.params.id, {endTime: endTime, status: "Completed"}, (err, docs) => {
            if(err) {
                console.log(err);
            }
            else {
                console.log("Updated :", docs)
            }
        })

    }
    catch(err) {
        console.log(err);
    }
});

app.listen(PORT, () => {
    console.log(`connected on server port ${PORT}`);
})