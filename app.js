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


// Sign up 
app.post("/adduser", (req,res)=>{
    const ID = req.body.ID;
    const Username = req.body.Username;
    const FullName = req.body.FullName;
    const Birthday = req.body.Birthday;
    const Password = req.body.Password;
    const Address = req.body.Address;
    
    // check if the user exist 
    db.query('SELECT Username FROM users WHERE Username = ?', [Username], (err, result) =>  {
        if (err){
            console.log("Error !!");
        }
        // if there is no error --> 
       else if( result.length > 0 ) {
           
                res.send('This username is already exist');
                console.log("This username is already exist");
        }
        else {
        
            db.query("insert into users values (?,?,?,?,?,?)",[ID,Username,FullName,Birthday,Password,Address],(err,result)=> {
                if (err){
                    console.log("Error !!");
                }
                // if there is no error --> 
                console.log("Result");
                res.send("Add to users");
            });
        
        }
    });
    
    
    });
    
app.listen('3000' , (err) => {
    if (err){
        throw err;
    }
    console.log('Server is Running');
}) 
