const express = require('express');
const app = express();
// const { MongoClient } = require('mongodb'); // Correct import syntax
// async function main() {
//     const uri = "mongodb+srv://slimanas3d1996:p%40ssw0rd%279%27%21@cluster0.eqd9ks9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//     const client = new MongoClient(uri);

//   try {
//     await client.connect();
//     console.log("Connected successfully to server");
//     //const database = client.db("your_database_name"); // Replace with your database name
//     // Perform operations here
//   } catch (e) {
//     console.error(e);
//   } finally {
//     await client.close();
//   }
// }

// main().catch(console.error);

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '',
  database : 'node_project'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});




const port = process.env.PORT || 4000;

const users = [];

app.use(express.json())

app.post("/register", (req , res) => {
    try{
        let { email , password } = req.body
        //find user
        let sql1 = `SELECT * From users where email = '${email}'`;
        let findUser =  connection.query(sql1);
        if(findUser){
            res.status(400).send("wrong email or password !");
            return;
        }
                // insert statment
        let sql2 = `INSERT INTO users(email,password)
        VALUES('${email}','${password}')`;

        // execute the insert statment
        connection.query(sql2);
        users.push({email,password});
        res.send(201).send("registered successfully !");
    } catch(err){
        res.status(500).send({message: err.message })
    }
})

app.post("/login" , (req , res)=>{
    try{
        let { email , password } = req.body
        //find user
        let sql1 = `SELECT * From users where email = '${email}'`;
        let findUser =  connection.query(sql1);
        // if(!findUser){
        if (findUser){
            res.status(400).send("wrong email or password !")
            return
        }

        if(password  == findUser.password){
            res.send(201).send(findUser.password);
        }else{
            res.status(400).send("wrong email or password !")
        }
    }catch(err){
        res.status(500).send({message: err.message })
    }
})


app.listen(port, () => {
    console.log("server is started on port 3000")
})