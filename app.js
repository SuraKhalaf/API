const express = require ('express');
const mysql = require('mysql');
const app = express(); // to initialize express
const jwt = require("jsonwebtoken");
app.use(express.json()); ////This middleware will allow us to pull req.body.<params>
require("dotenv").config();
require("crypto").randomBytes(64).toString("hex"); //This will generate a RANDOM string

//create connection database 
const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "tweet_app",
});


// connect database 
db.connect((err)=>{
    if (err){
        throw err;
    }
    // if there is no error --> 
    console.log("Connection Done!");
}); 

// accessTokens
function generateAccessToken(user) 
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) 
}

    // refreshTokens
let refreshTokens = []
function generateRefreshToken(user) 
{
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
    refreshTokens.push(refreshToken)
    return refreshToken
}

//Login 
app.post("/loginUser", (req,res)=>{
    const Username = req.body.Username;
    const Password = req.body.Password;

    //AUTHENTICATE LOGIN AND RETURN JWT TOKEN

    db.query('SELECT * FROM users WHERE Username = ? and password = ?', [Username, Password], async (err, result) =>  {
        if (err){
            console.log("Error !!");
        }
        if (result.length > 0) {
        
            const accessToken = generateAccessToken ({user: req.body.Username})
            const refreshToken = generateRefreshToken ({user: req.body.Username})
            res.json ({accessToken: accessToken, refreshToken: refreshToken})
        
          //  res.send('Welcome to Home page');
          //  console.log("Welcome to Home page");
        } else {
            res.send('Incorrect Username and/or Password!');
        }			
    });
    });

    //REFRESH TOKEN API
app.post("/refreshToken", (req,res) => {
   
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken ({user: req.body.Username})
    const refreshToken = generateRefreshToken ({user: req.body.Username})
    //generate new accessToken and refreshTokens
    res.json ({accessToken: accessToken, refreshToken: refreshToken})
    });


app.listen('3000' , (err) => {
    if (err){
        throw err;
    }
    console.log('Server is Running');
}) 
