// .env
require('dotenv').config()
// Express
const express = require('express');
const app = express();
// chemin absolue
let path = require('path');
//JWT
const jwt = require ('jsonwebtoken')
//JWT
const mongoose= require('mongoose');
const db = require('./config/keys').MongoURI;
//Mongodb
mongoose.connect(db, {useNewUrlParser: true})
    .then(()=>console.log('MongoDB Connected'))
    .catch(err=> console.log(err))
 
app.use(express.urlencoded({extended: false}))

//EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json())

const User = require('./models/User')

app.get('/',(req,res)=>{

    res.render('index')

})


app.get('/users/register',(req,res)=>{res.render('register')})


app.post('/users/register',(req,res)=>{
    
    const { name, password} = req.body
    //on test si l'utilisateur existe deja dans la bdd
        User.findOne({name: name})
        .then(user=> {
            if(user){
                res.send('Utilisateur existe deja')

            }else{
                const newUser = new User({
                    name,
                    password
                })

                newUser.save()
                .then(user =>{
                    res.redirect('login')
                })
                .catch(err=> console.log(err));
            }
        })
      

})






app.get('/users/login',(req,res)=>{

    res.render('index')

})
//authentification
app.post('users/login',(req,res)=>{

    const username = req.body.username
    const user = { name: username }
   
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    //on passe le token en json
    res.json({ accesToken: accessToken})
})

function authenticateToken(req,res,nex){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token== null) return res.sendStatus(401)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })

}

app.listen(3000);