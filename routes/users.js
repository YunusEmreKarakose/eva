const express = require('express');
const router = express.Router();
const mysql = require('../db/mysqlDb');
const auth =  require('../db/authmiddleware');
const fs = require('fs');
const userLogger =require('../db/userLogger')
/* user register */
router.post('/register', (req, res, next) => {
  let postData={
    name:req.body.name,
    surname:req.body.surname,
    email:req.body.email,
    password:req.body.password
  }
  //create log file for user
  let filepath='./userLogs/'+postData.email+'LogFile.txt';
  fs.writeFile(filepath,"", (err)=> {
    if (err) console.log({"log":err});
    console.log('Log File is created successfully.');
  });
  //insert into users table
  let postQuery="INSERT INTO users SET ?"
  mysql.query(postQuery,postData,(err,results,fields)=>{
    if(err){  res.json({"mysql":err})}
    res.json({"mysql":"user registration done"});
  })
});
/* user login */
router.post('/login', (req, res, next)=> {
  let email=req.body.email;
  let password=req.body.password;
  let postQuery="SELECT * FROM users WHERE email = ? AND password = ?"
  mysql.query(postQuery,[email,password],(err,results,fields)=>{
    if(err){  res.json({"mysql":err})}
    req.session.userId=results[0].userId;
    
    userLogger(results[0].userId,"LOG IN");
    res.json({"message":"login successful"});
  })
});
/* add balance */
router.post('/addBalance', auth, (req, res, next)=> {
  let balance=req.body.balance;
  let postQuery="UPDATE users SET balance = balance + ? WHERE userId = ?"
  mysql.query(postQuery,[balance,req.session.userId],(err,results,fields)=>{
    if(err){  res.json({"mysql":err})}
    let logStr=" ADD "+balance+" TO BALANCE";
    userLogger(req.session.userId,logStr);
    res.json({"mysql":"balance updated"});
  })
});
/* get user info*/
router.get('/getUserInfo', auth, (req, res, next)=> {
  let getQuery="SELECT * FROM users WHERE userId = ?"
  mysql.query(getQuery,req.session.userId,(err,results,fields)=>{
    if(err){  res.json({"mysql":err})}
    res.json({"user info":results[0]});
  })
});
/* get user portfolio */
router.get('/getPortfolio', auth, (req, res, next)=> {
  let getQuery="SELECT * FROM shares WHERE userId = ?"
  mysql.query(getQuery,req.session.userId,(err,results,fields)=>{
    if(err){  res.json({"mysql":err})}
    res.json({"user portfolio":results});
  })
});
module.exports = router;
