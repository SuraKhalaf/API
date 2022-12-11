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
// Sign up 
app.post("/adduser", (req,res)=>{
    const ID = req.body.ID;

    const Username = req.body.Username;
    const Password = req.body.Password;

    db.query('SELECT * FROM users WHERE Username = ? and password = ?', [Username, Password], async (err, result) =>  {
        if (err){
            console.log("Error !!");
        }
        if (result.length > 0) {
        
            const accessToken = generateAccessToken ({user: req.body.Username})
            const refreshToken = generateRefreshToken ({user: req.body.Username})
            res.json ({accessToken: accessToken, refreshToken: refreshToken})
        
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

    //retire refresh tokens on logout
    app.delete("/logout", (req,res)=>{
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    res.status(204).send("Logged out!")
    })

    // Add new tweet
app.post("/addTweet", (req,res)=>{
    const ID = req.body.ID;
    const UserId = req.body.UserId;
    const Description = req.body.Description;
    const Hashtag = req.body.Hashtag;
    const Date = req.body.Date;
    
   
            db.query("insert into tweets values (?,?,?,?,?)",[ID,UserId,Description,Hashtag,Date],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log("Add to tweets");
                res.send("Add to tweets");
            });      
    });
    

// Delete a tweet 
app.post("/deleteTweet", (req,res)=>{
    const ID = req.body.ID;
    
            db.query("DELETE FROM tweets WHERE ID = ?",[ID],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log("Tweet has Deleted");
                res.send("Tweet has Deleted");
            });      
    });

 

//Edit a tweet
app.post("/editTweet", (req,res)=>{
    const ID = req.body.ID;
    const Description = req.body.Description;
            db.query("UPDATE tweets SET Description= ? WHERE ID = ?",[Description,ID],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log("Tweet has Edited");
                res.send("Tweet has Edited");
            });      
    });

    //Retrieve all tweets (use paging) 
app.post("/RetrieveTweet/:lastID", (req,res)=>{
    const lastID = parseInt(req.params.lastID);
    const ID = req.body.ID;
    const Description = req.body.Description;
            db.query("SELECT * FROM tweets LIMIT ? , 3 " ,[lastID],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log(result);
                res.send(result);
                
            });      
    });


// Retrieve specific user tweets
app.post("/RetrieveUser", (req,res)=>{
    const UserId = req.body.UserId;
            db.query("select * from tweets Where UserId = ?",[UserId],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log(result);
                res.send(result);
            });      
    });


//Retrieve user info
app.post("/RetrieveUserInfo", (req,res)=>{
    const ID = req.body.ID;
            db.query("select ID,Username,FullName,Birthday,Address from users Where ID = ?",[ID],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log(result);
                res.send(result);
            });      
    });


//Edit my own info
app.post("/editMyInfo", (req,res)=> {
    const ID = req.body.ID;
    const FullName = req.body.FullName;
    const Birthday = req.body.Birthday;
    const Address = req.body.Address;

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

            db.query("UPDATE users SET FullName = ?,Birthday = ?, Address =? WHERE ID = ?",[FullName,Birthday,Address,ID],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log("Your information has Edited");
                res.send("information has Edited");
            });      
        
          //  res.send('Welcome to Home page');
          //  console.log("Welcome to Home page");
        } else {
            res.send('Incorrect Username and/or Password!');
        }			
    });
});
//Change password
app.post("/changePass", (req,res)=>{
    const ID = req.body.ID;
    const Password = req.body.Password;
    const Username = req.body.Username;

    //AUTHENTICATE LOGIN AND RETURN JWT TOKEN

    db.query('SELECT * FROM users WHERE Username = ? and password = ?', [Username, Password], async (err, result) =>  {
        if (err){
            console.log("Error !!");
        }
        if (result.length > 0) {
        
            const accessToken = generateAccessToken ({user: req.body.Username})
            const refreshToken = generateRefreshToken ({user: req.body.Username})
            res.json ({accessToken: accessToken, refreshToken: refreshToken})


            db.query("UPDATE users SET Password= ? WHERE ID = ?",[Password,ID],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log("Password changed");
                res.send("Password changed");
            });
        
          //  res.send('Welcome to Home page');
          //  console.log("Welcome to Home page");
        } else {
            res.send('Incorrect Username and/or Password!');
        }			
    });

    

                  
    });
    


    
    //retire refresh tokens on logout
    app.delete("/logout", (req,res)=>{
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    res.status(204).send("Logged out!")
    });




app.listen('3000' , (err) => {
    if (err){
        throw err;
    }
    console.log('Server is Running');
}) 
