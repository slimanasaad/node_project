const express = require('express');
var _ = require('underscore');
const app = express();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'id22126002_node_project',
  password : 'P@ssw0rd',
  database : 'id22126002_node_project'
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})



const port = process.env.PORT || 4000;

const users = [];


app.use(express.json())

app.post("/register", (req , res) => {
    try{
        let { email , password } = req.body
        //find user
            connection.query("SELECT * FROM users WHERE email = ?", [email], function (err, result) {
              if(result.length > 0){
                res.status(400).send("wrong email or password !");
            }else{
            // insert statment
            let sql2 = `INSERT INTO users(email,password)
            VALUES('${email}','${password}')`;
            // execute the insert statment
            connection.query(sql2);
            connection.query("SELECT * FROM users WHERE email = ?", [email], function (err, result) {
                res.send({"message":"registered successfully !","user":result});              
            });
            }
            });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.post("/login" , (req , res)=>{
    try{
        let { email , password } = req.body
        //find user
        connection.query("SELECT * FROM users WHERE email = ? and password = ?", [email,password], function (err, result) {
            if(result.length > 0){
                res.send({"message":"login successfully !","user":result});              
          }else{
            res.status(400).send("wrong email or password !");

          }
          });



    }catch(err){
        res.status(500).send({message: err.message })
    }
}) 

app.post("/add_restaurant" , (req , res)=>{

    try{
        let { name , location } = req.body
        //find user
            // insert statment
            let sql2 = `INSERT INTO restaurants(name,location)
            VALUES('${name}','${location}')`;
            // execute the insert statment
            connection.query(sql2);
            connection.query("SELECT * FROM restaurants WHERE name = ?", [name], function (err, result) {
                res.send({"message":"restaurant added successfully !","restaurant":result});              
            });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_restaurant" , (req , res)=>{
    try{
        //find user
        connection.query("SELECT * FROM restaurants", function (err, result) {
            res.send({"message":"all restaurants","restaurant":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.post("/add_meal" , (req , res)=>{

    try{
        let { name , restaurant_id , price } = req.body
        //find user
            // insert statment
            let sql2 = `INSERT INTO meals(name,restaurant_id,price)
            VALUES('${name}','${restaurant_id}','${price}')`;
            // execute the insert statment
            connection.query(sql2);
            connection.query("SELECT * FROM meals WHERE name = ? and restaurant_id", [name,restaurant_id], function (err, result) {
                res.send({"message":"meal added successfully !","meal":result});              
            });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_all_meals" , (req , res)=>{
    try{
        //find user
        connection.query("SELECT * FROM meals", function (err, result) {
            res.send({"message":"all meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_restaurant_meals" , (req , res)=>{
    try{
        let { restaurant_id } = req.body
        //find user
        connection.query("SELECT * FROM meals where restaurant_id = ?" , [restaurant_id], function (err, result) {
            res.send({"message":"restaurant meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.post("/order" , (req , res)=>{
    try{
        let sections = req.body.order;
        connection.query("SELECT MAX(orderID) FROM orders" , function (err, result) {
            if(!result[0]['MAX(orderID)']){
                sections.forEach(element => {
                    connection.query("INSERT INTO orders(users_id,restaurant_id,meal_id,num,orderID) VALUES(?,?,?,?,?)"
                     , [element.user_id,element.restaurant_id,element.meal_id,element.num,1], function (err, result) {
                    });            
                });
            }else{
                let orderID = result[0]['MAX(orderID)']+1;
                sections.forEach(element => {
                    connection.query("INSERT INTO orders(users_id,restaurant_id,meal_id,num,orderID) VALUES(?,?,?,?,?)"
                     , [element.user_id,element.restaurant_id,element.meal_id,element.num,orderID], function (err, result) {
                    });            
                });
            }
            res.send({"message":"order add successfully"});              
        });
        //find user
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.listen(port, () => {
    console.log("server is started on port 4000")
      console.log(port)

})
