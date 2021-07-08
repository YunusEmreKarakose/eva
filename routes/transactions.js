const express = require('express');
const router = express.Router();
const mysql = require('../db/mysqlDb');
const auth =  require('../db/authmiddleware');
const userLogger = require('../db/userLogger')
/*
  Every company has 100 share
  User buy share and pay to company
  User sell share to company
*/
//SELL
router.post('/sell', auth, (req, res, next)=> {
  let shareId=req.body.shareId;
  getShare(req.session.userId,shareId).then(results=>{
    let val=results[0].value;
    let ratio=results[0].shareRatio;
    let cId=results[0].companyId;    
    //DELETE share
    deleteShare(req.session.userId,shareId).then(results2=>{
      //update user balance
      uUserBalance(req.session.userId,(val*ratio)).catch(err=>{console.log(err)});
      //update company balance
      uCompanyBalance(cId,-1*(val*ratio),val).catch(err=>(console.log(err)));
      //log
      let logContent= "SOLD cId:"+cId+" SHARE ("+ratio +" PIECE) FOR "+(val*ratio);
      userLogger(req.session.userId,logContent);
      res.json({"message":"sell ok"});
    }).catch(err=>{
      res.json({"mysql":err});
    })
  }).catch(err=>{
    res.json({"mysql":err});
  })
});
//get share data
async function getShare(userId,shareId){  
  let promise=new Promise((resolve,reject)=>{   
    //get user data
    let query="SELECT * FROM shares WHERE userId=? AND shareId=?"; 
    mysql.query(query,[userId,shareId],(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  });
  let result=await promise;
  return result;  
}
//delete from share table
async function deleteShare(userId,shareId){  
  let promise=new Promise((resolve,reject)=>{   
    //get user data
    let query="DELETE FROM shares WHERE userId=? AND shareId=?"; 
    mysql.query(query,[userId,shareId],(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  });
  let result=await promise;
  return result;  
}

/*BUY*/
router.post('/buy', auth, (req, res, next)=> {
  let cName=req.body.companyName;
  let sCount=req.body.shareCount;
  getData(req.session.userId,cName).then(result=>{
    //enough balance to buy share
    if((result[0].balance) < (sCount*result[0].value)){
      res.json({"message":"balance is not enough"});
    }else{
      getShares(result[0].companyId,sCount).then(sResult=>{
        //user can buy share
        if(sResult.avaliable){
          //update user balance
          uUserBalance(req.session.userId,-1*(sCount*result[0].value)).catch(err=>{console.log(err)})
          //update company balance
          uCompanyBalance(result[0].companyId,(sCount*result[0].value),result[0].value).catch(err=>(console.log(err)));
          //add transaction in shares table
          addShare(req.session.userId,result[0].companyId,sCount,result[0].value).catch(err=>(console.log(err)));          
          //log
          let logContent= "BOUGHT cId:"+result[0].companyId+" SHARE ("+sCount+" PIECE) FOR "+(sCount*result[0].value);
          userLogger(req.session.userId,logContent);
          res.json({"message":"buy OK"});
        }else{
          res.json({"message":"there is not enough share","shareCount":sResult.count});
        }
      }).catch(err=>{
        res.json({"mysql":err});
      })
    }  
  }).catch(err=>{
    res.json({"mysql":err});
  })
});

//get user and company share data
async function getData(userId,cName){  
  let promise=new Promise((resolve,reject)=>{   
    //get user data
    let query="SELECT companyId,value,users.balance FROM eva.companies,eva.users WHERE companies.name=? AND userId=?"; 
    mysql.query(query,[cName,userId],(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  });
  let result=await promise;
  return result;
}
//available shares
async function getShares(cId,sCount){
  let promise=new Promise((resolve,reject)=>{
    let query="SELECT SUM(shareRatio) as sold FROM shares WHERE companyId = ?"; 
    mysql.query(query,cId,(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  })
  var result=await promise;
  result=JSON.stringify(result)
  result=JSON.parse(result)
  //max number of share is 100
  if(result[0].sold==null || result[0].sold<(100-sCount)){
    return {"avaliable":1,"count":100-result[0].sold};
  }else{
    return {"avaliable":0,"count":100-result[0].sold};
  }
}
//update user balance
async function uUserBalance(uId,amount){
  let promise=new Promise((resolve,reject)=>{
    let query="UPDATE users SET balance= balance + ? WHERE userId = ?"; 
    mysql.query(query,[amount,uId],(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  })
  let result=await promise;
  return result
}
//update company balance
async function uCompanyBalance(cId,amount,val){
  let promise=new Promise((resolve,reject)=>{
    let query="UPDATE companies SET balance= balance + ?,value=? WHERE companyId = ?"; 
    mysql.query(query,[amount,val,cId,],(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  })
  let result=await promise;
  return result
}
//update share table
async function addShare(uId,cId,sCount,val){
  let promise=new Promise((resolve,reject)=>{
    let data={
      userId:uId,
      companyId:cId,
      shareRatio:parseInt(sCount),
      value:val,
      tDate:new Date()
    }
    let query='INSERT INTO shares SET ?'; 
    mysql.query(query,data,(err,results,fields)=>{
      if(err) reject(err);
      resolve(results);
    })
  })
  let result=await promise;
  return result
}
module.exports = router;
