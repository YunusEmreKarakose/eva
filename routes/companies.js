const express = require('express');
const router = express.Router();
const mysql = require('../db/mysqlDb');
const auth =  require('../db/authmiddleware');

/* company register */
router.post('/register', (req, res, next) => {
  let postData={
    name:req.body.name,
    value:req.body.value,
    balance:req.body.balance
  }
  let postQuery="INSERT INTO companies SET ?"
  mysql.query(postQuery,postData,(err,results,fields)=>{
    if(err){  res.json({"mysql":err})}
    res.json({"mysql":"company registration done"});
  })
});
/* get list of companies with shares sold*/
router.get('/getCSList',(req,res,next)=>{
    let getQuery="SELECT companies.name,companies.value,SUM(shares.shareRatio) FROM shares,companies WHERE shares.companyId=companies.companyId  GROUP BY companies.companyId";
    mysql.query(getQuery,(err,results,fields)=>{
        if(err){  res.json({"mysql":err})}
        res.json({"mysql":results});
    })   
});
/* get list of companies*/
router.get('/getCList',(req,res,next)=>{
    let getQuery="SELECT name,value FROM companies";
    mysql.query(getQuery,(err,results,fields)=>{
        if(err){  res.json({"mysql":err})}
        res.json({"mysql":results});
    })   
});
module.exports = router;
