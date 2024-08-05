const express = require('express');
//var _ = require('underscore');
const app = express();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination:  "./upload/images",
    filename: (req , file , cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage : storage,
})
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

app.use("/img", express.static('upload/images'));
app.post("/upload", upload.single('img'), (req , res)=>{
    console.log(req.file);

    res.json({
        success: 1,
        img_url: `https://node-project-n9j8.onrender.com/img/${req.file.filename}`
    })
})


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


app.post("/add_restaurant" , upload.single('img'), (req , res)=>{

    try{
        let img_url = `https://node-project-n9j8.onrender.com/img/${req.file.filename}`;
        let img_sql = `INSERT INTO images(url)
            VALUES('${img_url}')`;
        connection.query(img_sql);
        connection.query("SELECT id FROM images WHERE url = ?", [img_url], function (err, result) {  
            let myObj = result[0];
            for (const x in myObj) {
                var image_id = myObj[x];
                console.log(image_id);
              }
        let { name , location , owner_id , description } = req.body
        //find user
            // insert statment
            let sql2 = `INSERT INTO restaurants(name,location,owner_id,description,image_id)
            VALUES('${name}','${location}','${owner_id}','${description}','${image_id}')`;
            // execute the insert statment
            connection.query(sql2);
            connection.query("SELECT restaurants.* , users.id as owner_id , users.name as owner_name , users.email as owner_email , images.id as image_id , images.url as url FROM restaurants INNER JOIN users on restaurants.owner_id = users.id INNER JOIN images on restaurants.image_id = images.id WHERE restaurants.name = ?", [name], function (err, result) {
                let response = []; 
                let i = 0;
                result.forEach(element => {
                   //   result[0].id
                   response[i] = {
                    "id":element.id,"name":element.name,"location":element.location, "description":element.description,"owner_id":element.owner_id,"created_at":element.created_at,"updated_at":element.updated_at,"owner": {"id":element.owner_id,"name":element.owner_name,"email":element.owner_email},"image":{"id":element.image_id,"url":element.url}
                };
                   i++; 
                });
               res.send({"message":"restaurant added successfully !",response});    
              //res.send({"message":"restaurant added successfully !","restaurant":result});              
            });
            
         });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_restaurant" , (req , res)=>{
    try{
        //find user
            connection.query("SELECT restaurants.* , users.id as owner_id , users.name as owner_name , users.email as owner_email , images.id as image_id , images.url as url FROM restaurants INNER JOIN users on restaurants.owner_id = users.id INNER JOIN images on restaurants.image_id = images.id", function (err, result) {
                let response = []; 
                let i = 0;
                result.forEach(element => {
                   //   result[0].id
                   response[i] = {
                    "id":element.id,"name":element.name,"location":element.location,"rating":element.rating,"description":element.description,"owner_id":element.owner_id,"created_at":element.created_at,"updated_at":element.updated_at,"owner": {"id":element.owner_id,"name":element.owner_name,"email":element.owner_email},"image":{"id":element.image_id,"url":element.url}
                };
                   i++; 
                });
               res.send({"message":"restaurant added successfully !",response});    
              //res.send({"message":"restaurant added successfully !","restaurant":result});              
            });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})
    

app.get("/show_restaurant_by_ownerId" , (req , res)=>{
    try{
        let { owner_id } = req.body

        //find user
            connection.query("SELECT restaurants.* , users.id as owner_id , users.name as owner_name , users.email as owner_email , images.id as image_id , images.url as url FROM restaurants INNER JOIN users on restaurants.owner_id = users.id INNER JOIN images on restaurants.image_id = images.id where owner_id = ?" , [owner_id] , function (err, result) {
                let response = []; 
                let i = 0;
                result.forEach(element => {
                   //   result[0].id
                   response[i] = {
                    "id":element.id,"name":element.name,"location":element.location,"rating":element.rating, "description":element.description,"owner_id":element.owner_id,"created_at":element.created_at,"updated_at":element.updated_at,"owner": {"id":element.owner_id,"name":element.owner_name,"email":element.owner_email},"image":{"id":element.image_id,"url":element.url}
                };
                   i++; 
                });
               res.send({"message":"restaurant added successfully !",response});    
              //res.send({"message":"restaurant added successfully !","restaurant":result});              
            });
        }catch(err){
        res.status(500).send({message: err.message })
    }
})
  
  
app.post("/add_meal" , upload.single('img') , (req , res)=>{

    try{
        let img_url = `https://node-project-n9j8.onrender.com/img/${req.file.filename}`;
        let img_sql = `INSERT INTO images(url)
            VALUES('${img_url}')`;
        connection.query(img_sql);
        connection.query("SELECT id FROM images WHERE url = ?", [img_url], function (err, result) {  
            let myObj = result[0];
            for (const x in myObj) {
                var image_id = myObj[x];
                console.log(image_id);
              }
        let { name , restaurant_id , price , category_id , description} = req.body
        //find user
            // insert statment
            let sql2 = `INSERT INTO meals(name,restaurant_id,price,category_id , description ,image_id )
            VALUES('${name}','${restaurant_id}','${price}','${category_id}','${description}','${image_id}')`;
            // execute the insert statment
            connection.query(sql2);

            connection.query("SELECT meals.* , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description , images.id as image_id , images.url as url , categories.id as category_id , categories.name as category_name FROM `meals` INNER JOIN restaurants on meals.restaurant_id =  restaurants.id INNER JOIN images on meals.image_id =  images.id INNER JOIN categories on meals.category_id  =  categories.id WHERE meals.name = ? and meals.restaurant_id = ?", [name,restaurant_id], function  (err, result) {
                let response = []; 
                let i = 0;
                result.forEach(element => {
                   //   result[0].id
                   response[i] = {
                       "id":element.id,"name":element.name,"price":element.price,"description":element.description,"restaurant_id":element.restaurant_id,"image_id":element.image_id,"created_at":element.created_at,"updated_at":element.updated_at,"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"category": {"id":element.category_id , "name":element.category_name},"image": {"id":element.image_id,"url":element.url}
                   };
                   i++; 
                });
               res.send({"message":"all meals",response});              
             });
            });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})


app.get("/show_all_meals" , (req , res)=>{
    try{
        let { user_id } = req.body
        var arr = [];
        var favourite;
        connection.query("SELECT meal_id from favourite where user_id = ?",[user_id], function  (err, result1) {
        // arr = result;
        var string=JSON.stringify(result1);
        var json =  JSON.parse(string);
        for (const x in json) {
            arr[x] = json[x]['meal_id'];
          }
        connection.query("SELECT meals.* , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.rating as restaurant_rating , restaurants.description as restaurant_description , images.id as image_id , images.url as url , categories.id as category_id , categories.name as category_name FROM `meals` INNER JOIN restaurants on meals.restaurant_id =  restaurants.id INNER JOIN images on meals.image_id =  images.id INNER JOIN categories on meals.category_id  =  categories.id ", function  (err, result) {
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               if(arr.includes(element.id)){
                console.log(element.id);
                favourite = true;
               }else{
                favourite = false;
               }
               response[i] = {
                   "id":element.id,"name":element.name,"price":element.price,"description":element.description,"favourite":favourite,"restaurant_id":element.restaurant_id,"image_id":element.image_id,"created_at":element.created_at,"updated_at":element.updated_at,"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"rating":element.restaurant_rating,"location":element.restaurant_location,"description":element.restaurant_description},"category": {"id":element.category_id , "name":element.category_name},"image": {"id":element.image_id,"url":element.url},"favourite":favourite
               };
               i++; 
            });
           res.send({"message":"all meals",response});              
         });
        });

    }catch(err){
        res.status(500).send({message: err.message })
    }
})


app.get("/show_restaurant_meals" , (req , res)=>{
    try{
        let { restaurant_id } = req.body
        //find user
        connection.query("select meals.* , restaurants.id as restaurant_id, restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description , images.id as image_id , images.url as url , categories.id as category_id , categories.name as category_name FROM `meals` INNER JOIN restaurants on meals.restaurant_id =  restaurants.id INNER JOIN images on meals.image_id =  images.id INNER JOIN categories on meals.category_id  =  categories.id  where restaurant_id = ?" , [restaurant_id], function (err, result) {           
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               response[i] = {
                   "id":element.id,"name":element.name,"price":element.price,"description":element.description,"restaurant_id":element.restaurant_id,"image_id":element.image_id,"created_at":element.created_at,"updated_at":element.updated_at,"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"category": {"id":element.category_id , "name":element.category_name},"image": {"id":element.image_id,"url":element.url}
               };
               i++; 
            });
           res.send({"message":"restaurant meals",response});    
          
          //res.send({"message":"restaurant meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})
app.get("/show_meals_by_category_id" , (req , res)=>{
    try{
        let { category_id } = req.body
        //find user
        connection.query("select meals.* , restaurants.id as restaurant_id, restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description , images.id as image_id , images.url as url , categories.id as category_id , categories.name as category_name FROM `meals` INNER JOIN restaurants on meals.restaurant_id =  restaurants.id INNER JOIN images on meals.image_id =  images.id INNER JOIN categories on meals.category_id  =  categories.id  where category_id = ?" , [category_id], function (err, result) {           
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               response[i] = {
                   "id":element.id,"name":element.name,"price":element.price,"description":element.description,"restaurant_id":element.restaurant_id,"image_id":element.image_id,"created_at":element.created_at,"updated_at":element.updated_at,"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"category": {"id":element.category_id , "name":element.category_name},"image": {"id":element.image_id,"url":element.url}
               };
               i++; 
            });
           res.send({"message":"meals by category_id",response});    
          
          //res.send({"message":"restaurant meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})
app.post("/change-status", (req , res)=>{
    try{
        let { new_status,orderID } = req.body
        connection.query("UPDATE orders SET status = ? WHERE orderID = ?" , [new_status,orderID] , function (err, result) {
            res.send({"message":"Order status updated successfully "});              
          });

    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.post("/add-category", (req , res)=>{
    try{
        let { name } = req.body
        connection.query("INSERT into categories (name) VALUES(?)" , [name] , function (err, result) {
            res.send({"message":"category add successfully"});              
          });

    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_all_categories" , (req , res)=>{
    try{
        //find user
        connection.query("SELECT * FROM `categories`", function  (err, result) {
            res.send({"message":"all categories","categories":result});              
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
app.get("/show_orders_by_user_id" , (req , res)=>{
    try{
        let { user_id } = req.body
        //find user
        connection.query("SELECT orders.* , users.id as user_id , users.name as user_name , users.email as user_email , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description  ,  meals.id as meal_id , meals.name as meal_name , meals.price as meal_price , meals.description as meal_descreption FROM orders INNER JOIN restaurants on orders.restaurant_id =restaurants.id INNER JOIN meals on orders.meal_id = meals.id INNER JOIN users ON orders.users_id = users.id where orders.users_id = ?" , [user_id], function (err, result) {           
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               console.log(element);
               response[i] = {
                   "id":element.id,"user_id":element.user_id,"restaurant_id":element.restaurant_id,"meal_id":element.meal_id,"num":element.num,"orderID":element.orderID,"status":element.status,"created_at":element.created_at,"updated_at":element.updated_at,"user": {"id":element.user_id , "name":element.user_name , "email":element.user_email},"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"meal": {"id":element.meal_id,"name":element.meal_name,"price":element.meal_price,"description":element.meal_description}
               };
               i++; 
            });
           res.send({"message":"order by user",response});    
          
          //res.send({"message":"restaurant meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_orders_by_restaurant_id" , (req , res)=>{
    try{
        let { restaurant_id } = req.body
        //find user
        connection.query("SELECT orders.* , users.id as user_id , users.name as user_name , users.email as user_email , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description  ,  meals.id as meal_id , meals.name as meal_name , meals.price as meal_price , meals.description as meal_descreption FROM orders INNER JOIN restaurants on orders.restaurant_id =restaurants.id INNER JOIN meals on orders.meal_id = meals.id INNER JOIN users ON orders.users_id = users.id where orders.restaurant_id = ?" , [restaurant_id], function (err, result) {           
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               console.log(element);
               response[i] = {
                   "id":element.id,"user_id":element.user_id,"restaurant_id":element.restaurant_id,"meal_id":element.meal_id,"num":element.num,"orderID":element.orderID,"status":element.status,"created_at":element.created_at,"updated_at":element.updated_at,"user": {"id":element.user_id , "name":element.user_name , "email":element.user_email},"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"meal": {"id":element.meal_id,"name":element.meal_name,"price":element.meal_price,"description":element.meal_description}
               };
               i++; 
            });
           res.send({"message":"order by user",response});    
          
          //res.send({"message":"restaurant meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})


app.post("/add_favourite" , (req , res)=>{

    try{
        let { user_id , meal_id } = req.body
        //find user
            // insert statment
            let sql2 = `INSERT INTO favourite(user_id,meal_id)
            VALUES('${user_id}','${meal_id}')`;
            // execute the insert statment
            connection.query(sql2);

            connection.query("SELECT favourite.* , users.id as user_id , users.name as user_name , users.email as user_email , meals.id as meal_id , meals.name as meal_name , meals.description as description , meals.price as meal_price , meals.time as meal_time, meals.image_id as image_id , meals.restaurant_id as restaurant_id , images.id as image_id , meals.category_id as category_id, images.url as url , categories.id as category_id , categories.name as category_name , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description  FROM `favourite` INNER JOIN users on favourite.user_id = users.id INNER JOIN meals on favourite.meal_id =  meals.id inner join images on meals.image_id = images.id inner join categories on meals.category_id = categories.id inner join restaurants on meals.restaurant_id = restaurants.id WHERE favourite.user_id = ? and meal_id = ?", [user_id,meal_id], function  (err, result) {            
                let response = []; 
                let i = 0;
                result.forEach(element => {
                   //   result[0].id
                   response[i] = {
                       "id":element.id,"user_id":element.user_id,"meal_id":element.meal_id,"created_at":element.created_at,"updated_at":element.updated_at,"user": {"id":element.user_id,"name":element.user_name,"email":element.user_email},"meal": {"id":element.meal_id , "name":element.meal_name , "description":element.description , "price":element.meal_price , "time":element.meal_time , "restaurant_id":element.restaurant_id},"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"category": {"id":element.category_id , "name":element.category_name},"image": {"id":element.image_id,"url":element.url}
                   };
                   i++; 
                });
               res.send({"message":"favourite meal added successfully",response});              
             });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.get("/show_favourite_by_user_id" , (req , res)=>{
    try{
        let { user_id } = req.body
        //find user
        connection.query("SELECT favourite.* , users.id as user_id , users.name as user_name , users.email as user_email , meals.id as meal_id , meals.name as meal_name , meals.description as description , meals.price as meal_price , meals.time as meal_time, meals.image_id as image_id , meals.restaurant_id as restaurant_id , images.id as image_id , meals.category_id as category_id, images.url as url , categories.id as category_id , categories.name as category_name , restaurants.id as restaurant_id , restaurants.name as restaurant_name , restaurants.location as restaurant_location , restaurants.description as restaurant_description  FROM `favourite` INNER JOIN users on favourite.user_id = users.id INNER JOIN meals on favourite.meal_id =  meals.id inner join images on meals.image_id = images.id inner join categories on meals.category_id = categories.id inner join restaurants on meals.restaurant_id = restaurants.id WHERE favourite.user_id = ? ", [user_id], function  (err, result) {            
            let response = []; 
            let i = 0;
            result.forEach(element => {
               //   result[0].id
               response[i] = {
                    "id":element.id,"user_id":element.user_id,"meal_id":element.meal_id,"created_at":element.created_at,"updated_at":element.updated_at,"user": {"id":element.user_id,"name":element.user_name,"email":element.user_email},"meal": {"id":element.meal_id , "name":element.meal_name , "description":element.description , "price":element.meal_price , "time":element.meal_time , "restaurant_id":element.restaurant_id},"restaurant": {"id":element.restaurant_id,"name":element.restaurant_name,"location":element.restaurant_location,"description":element.restaurant_description},"category": {"id":element.category_id , "name":element.category_name},"image": {"id":element.image_id,"url":element.url}
                };
               i++; 
            });
           res.send({"message":"favourite meals by user",response});    
          
          //res.send({"message":"restaurant meals","meal":result});              
          });
    }catch(err){
        res.status(500).send({message: err.message })
    }
})

app.post("/rating" , (req , res)=>{
    try{
        let { restaurant_id , rating } = req.body
        connection.query("SELECT rating FROM restaurants where id = ?" , [restaurant_id] , function (err, result) {
            let myObj = result[0];
            var new_rating = 0;
            for (const x in myObj) {
                var old_rating = myObj[x];
              }
            if(old_rating == 0){
                new_rating = rating;
            }else{
                var total = old_rating + rating;
                new_rating = total / 2;
            }
            let sql = `UPDATE restaurants SET rating = '${new_rating}' where id = '${restaurant_id}'`;
            connection.query(sql, function (err, result) {  
                if (err) throw err;  
                console.log(result.affectedRows + " record(s) updated");  
                res.send(result.affectedRows + " record(s) updated");    

                });              
            });
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.listen(port, () => {
    console.log("server is started on port 4000")
      console.log(port)

})
