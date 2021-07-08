const express = require('express');
const router = express.Router();
const mysql=require('./mysqlDb');

requireAuthentication=(req, res, next)=> {
    if (req.session.userId) {
        var userId=req.session.userId;
        let sql=`SELECT * FROM users WHERE userId = ?`;
        mysql.query(sql,userId,(err,result,fields)=>{
            if(err){res.send({"mysql":err}); throw err;}
            else{
                if(result[0].userId==userId){
                    next();                   
                }else{            
                  res.json({"error":"user not found"});
                }
            }
        });
    } else {
       res.json({"error":"no session"});
    }
}

module.exports = requireAuthentication;