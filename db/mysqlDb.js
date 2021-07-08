const mysql=require('mysql');

//create connection
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'eva'
  });
//connect
db.connect(function(err){
    if(err){    console.log({"mysql":err}); throw err;}
    else{console.log({"mysql":"connected to db"});}
});
//create tables if not exists
//users
let usersTable = `create table if not exists users (
    userId int primary key auto_increment,
    name varchar(35) not null,
    surname varchar(35) not null,
    email varchar(320) unique not null,
    password varchar(35) not null,
    balance int default(0)
  )`;
db.query(usersTable, function(err, results, fields) {
    if (err) {
    console.log({"mysql":err.message});
    }
});

//companies
let cTable=`create table if not exists companies (
  companyId int primary key auto_increment,
  name varchar(35) not null unique,
  value int not null,
  balance int
)`;
db.query(cTable, function(err, results, fields) {
  if (err) {
  console.log({"mysql":err.message});
  }
});

//shares
let sTable=`create table if not exists shares (
    shareId int primary key auto_increment,
    userId int not null,
    foreign key(userId) references users(userId),
    companyId int not null,
    foreign key(companyId) references companies(companyId),
    shareRatio int not null,
    value int not null,
    tDate date not null
  )`;
db.query(sTable, function(err, results, fields) {
    if (err) {
    console.log({"mysql":err.message});
    }
});
module.exports=db;