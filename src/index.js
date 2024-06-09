const express = require('express');
var _ = require('underscore');
const app = express();
var mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'b8l9rpw1umrqnhmlgg24-mysql.services.clever-cloud.com',
  user     : 'ufepgwnkc0ufz53i',
  password : '9f9KEqPwimBh3PZw5q0h',
  database : 'b8l9rpw1umrqnhmlgg24',
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})



const port = process.env.PORT || 4000;

const users = [];


app.use(express.json())

app.post("/register", (req , res) => {
    try{
        let { name , email , password , type_id  } = req.body
        //find user
            connection.query("SELECT * FROM users WHERE email = ?", [email], function (err, result) {
              if(result.length > 0){
                res.status(400).send("This email is already exists !");
            }else{
            // insert statment
            let sql2 = `INSERT INTO users(name,email,password,type_id)
            VALUES('${name}','${email}','${password}' ,'${type_id}')`;
            // execute the insert statment
            connection.query(sql2);
            connection.query("SELECT users.*, users_type.name as type FROM users INNER JOIN users_type on users.type_id = users_type.id WHERE email = ?", [email], function (err, result) {
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
        connection.query("SELECT users.*, images.url as image_url , users_type.name as type FROM users INNER JOIN users_type on users.type_id = users_type.id INNER JOIN images on users.image_id = images.id  WHERE email = ? and password = ?", [email,password], function (err, result) {
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
        let { name , location , owner_id } = req.body
        //find user
            // insert statment
            let sql2 = `INSERT INTO restaurants(name,location,owner_id)
            VALUES('${name}','${location}','${owner_id}')`;
            // execute the insert statment
            connection.query(sql2);
            connection.query("SELECT restaurants.* , users.name as owner_name , users.email as owner_email FROM restaurants INNER JOIN users on restaurants.owner_id = users.id WHERE restaurants.name = ?", [name], function (err, result) {
                res.send({"message":"restaurant added successfully !","restaurant":result});              
            });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_restaurant" , (req , res)=>{
    try{
        //find user
        connection.query("SELECT restaurants.* , users.id as owner_id  , users.name as owner_name , users.email as owner_email FROM restaurants INNER JOIN users on restaurants.owner_id = users.id ", function (err, result) {
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               response[i] = {
                    "name":element.name,"location":element.location,"owner_id":element.owner_id,"created_at":element.created_at,"updated_at":element.updated_at,"owner": {"id":element.owner_id,"name":element.owner_name,"email":element.owner_email}
                };
               i++; 
            });
           res.send({"message":"all restaurants",response});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_restaurant_by_ownerId" , (req , res)=>{
    try{
        let { owner_id } = req.body

        //find user
        connection.query("SELECT restaurants.* , users.name as owner_name , users.email as owner_email FROM restaurants INNER JOIN users on restaurants.owner_id = users.id where owner_id = ?" , [owner_id] , function (err, result) {
            res.send({"message":"restaurant by owner_id ","restaurant":result});              
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
        connection.query("SELECT meals.* , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location FROM `meals` INNER JOIN restaurants on meals.restaurant_id =  restaurants.id ", function  (err, result) {
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               response[i] = {
                   "id":element.id,"name":element.name,"price":element.price,"restaurant_id":element.restaurant_id,"created_at":element.created_at,"updated_at":element.updated_at,"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location}
               };
               i++; 
            });
           res.send({"message":"all meals",response});              
         });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_restaurant_meals" , (req , res)=>{
    try{
        let { restaurant_id } = req.body
        //find user
        connection.query("select meals.* , restaurants.name as restaurant_name , restaurants.location as restaurant_location FROM `meals` INNER JOIN restaurants on meals.restaurant_id =  restaurants.id where restaurant_id = ?" , [restaurant_id], function (err, result) {           
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
