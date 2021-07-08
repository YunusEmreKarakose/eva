const mysql=require('./mysqlDb');
const fs = require('fs');
userLogger=(userId,content)=> {    
  let postQuery="SELECT email FROM users WHERE userId = ?"
  mysql.query(postQuery,userId,(err,results,fields)=>{
    if(err){  console.log({"mysql":err})}
    let logStr= userId+" "+content+" "+new Date()+"\n";
    let filepath='./userLogs/'+results[0].email+'LogFile.txt' ;
    fs.appendFile(filepath,logStr, (err)=> {
        if (err) console.log({"log":err});        
        console.log({"log":"log done"});
    });
  })
}

module.exports = userLogger;