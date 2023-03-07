// index.js
const express = require('express');
const bodyParser = require('body-parser');
var MongoClient= require('mongodb').MongoClient;
const url = "mongodb+srv://application:HelloWorld@justbalance.5omg9.mongodb.net/JustBalance?retryWrites=true&w=majority";
const bcrypt = require('bcrypt');


const app = express();
app.use(bodyParser.json());

app.post('/transactioninsert', (req, res) => {

    var obj = JSON.parse(JSON.stringify(req.body));
    var myobj = {lender_id: obj.lender_id,
                 borrower_id: obj.borrower_id,
                 borrower_name: obj.borrower_name,
                 lender_name: obj.lender_name,
                 title: obj.title,
                 description: obj.description,
                 cost: obj.cost,
                 date: obj.date,
                 approved_lender: obj.approved_lender,
                 approved_borrower: obj.approved_borrower,
                 date_added: obj.date_added}
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const collection = db.db("JustBalance").collection("Transactions");
        collection.insertOne(myobj, function(err, res){
            if(err) throw err;
            console.log("inserted trasaction");
            db.close();
        });
    });

    res.sendStatus(200);
});

app.post('/transactionlenderapprove', (req, res) => {
    var obj = JSON.parse(JSON.stringify(req.body));
    var myobj = { $set: {approved: "true"}};
    var ObjectId = require('mongodb').ObjectId;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const collection = db.db("JustBalance").collection("Transactions");
        collection.updateOne({_id:ObjectId(obj.id)}, {$set: {approved_lender: "true"}}, {w:1}, function(err, res){
            if(err) throw err;
            console.log("update the transaction");
            db.close();
        });
    });

    res.sendStatus(200);
});

app.post('/transactionborrowerapprove', (req, res) => {
    var obj = JSON.parse(JSON.stringify(req.body));
    var myobj = { $set: {approved: "true"}};
    var ObjectId = require('mongodb').ObjectId;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const collection = db.db("JustBalance").collection("Transactions");
        collection.updateOne({_id:ObjectId(obj.id)}, {$set: {approved_borrower: "true"}}, {w:1}, function(err, res){
            if(err) throw err;
            console.log("update the transaction");
            db.close();
        });
    });

    res.sendStatus(200);
});

app.post('/userinsert', (req, res) => {
    var obj = JSON.parse(JSON.stringify(req.body));
    var myobj = {UserName: obj.UserName,
                 FirstName: obj.FirstName,
                 LastName: obj.LastName}
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const collection = db.db("JustBalance").collection("Users");
        collection.insertOne(myobj, function(err, res){
            if(err) throw err;
            console.log("inserted user");
            db.close();
        });
    });

    res.sendStatus(200);
});

app.post('/useradd', (req, res) => {
    const saltRounds = 10;
    var obj = JSON.parse(JSON.stringify(req.body));
    var username = obj.UserName.toLowerCase();
    var displayname = obj.UserName;

    bcrypt.hash(obj.Password, saltRounds, function(err, hash) {
        // Store hash in your password DB.

        var myobj = {UserName: username,
                     DisplayName: displayname,
                     Password: hash}
        MongoClient.connect(url, async function (err, db) {
            if (err) throw err;
            
            await db.db("JustBalance").collection("Users").find({UserName: username}).toArray(function (err, result) {
                if (err) throw err;
                if (result.length == 0)
                {
                    db.db("JustBalance").createCollection(displayname, function(err, res){
                        if (err) throw err;
                    });
                    MongoClient.connect(url, async function (err, db) {
                        const collection = db.db("JustBalance").collection("Users");
                        collection.insertOne(myobj, function(err, result){
                            if(err) throw err;
                            console.log("Created User");
                            res.sendStatus(200);
                            db.close();
                        });
                    });
                }
                else
                {
                    res.sendStatus(400);
                    db.close();
                }
            });
        });
    });
});

app.post('/addfriend', (req, res) => {
    var obj = JSON.parse(JSON.stringify(req.body));
    var friendsname = obj.FriendsName.toLowerCase();
    var frienddisplayname = obj.FriendsName;
    var displayname = obj.UserName;
    var alreadyfriends = false;
    // Store hash in your password DB.

    
    
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        await db.db("JustBalance").collection("Users").find({UserName: friendsname}).toArray(async function (err, result) {
            if (err) throw err;
            if (result.length != 0)
            {
                var myobj1 = {FriendsName : result[0].DisplayName,
                    UserApproved: "True",
                    FriendApproved: "False"}
                var myobj2 = {FriendsName   : displayname,
                    UserApproved: "False",
                    FriendApproved: "True"}

                    console.log(result[0].DisplayName);
                await db.db("JustBalance").collection(displayname).find({FriendsName: result[0].DisplayName}).toArray(function (err, result2) {
                    console.log(result2);
                    if(result2.length == 0)
                    {
                        MongoClient.connect(url, function (err, db) {
                            const collection = db.db("JustBalance").collection(displayname);
                            collection.insertOne(myobj1, function(err, result){
                                if(err) throw err;
                                console.log("Inserted friend request on my table");
                                db.close();
                            });
                        });
                    }
                    else
                    {
                        alreadyfriends = true;
                    }
                });
                await db.db("JustBalance").collection(result[0].DisplayName).find({FriendsName: displayname}).toArray(function (err, result3) {
                    if(result3.length == 0)
                    {
                        MongoClient.connect(url, function (err, db) {
                            const collection = db.db("JustBalance").collection(result[0].DisplayName);
                            collection.insertOne(myobj2, function(err, result){
                                if(err) throw err;
                                console.log("Inserted friend request on friends table");
                                db.close();
                                res.sendStatus(200);
                            });
                        });
                    }
                    else
                    {
                        console.log("Already Friends")
                        alreadyfriends = true;
                        res.sendStatus(401);
                    }
                });
                
            }
            else
            {
                res.sendStatus(400);
                db.close();
            }
        });
    });

});

app.post('/userlogin', (req, res) => {
    const saltRounds = 10;
    var obj = JSON.parse(JSON.stringify(req.body));
    var username = obj.UserName.toLowerCase();

    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        await db.db("JustBalance").collection("Users").findOne({UserName: username}, function (err, result) {
            if (err) throw err;
            if(result != null)
            {
                bcrypt.compare(obj.Password, result.Password, function(err, result2) {
                    if(result2 == true)
                    {
                        res.sendStatus(200);
                        console.log("User: " + username + " Has Logged In");
                    }
                    else
                    {
                        console.error("failed login, failed password hash")
                        //unauthorized
                        res.sendStatus(401);
                    }
                });
            }
            else
            {
                console.error("failed login, already a user")
                //unauthorized
                res.sendStatus(401);
            }
        });
        
        db.close();
    });


});

app.get('/getdisplayname', (req, res) => {
    MongoClient.connect(url, async function (err, db) {
        var username = req.query.UserName.toLowerCase();
        if (err) throw err;
        await db.db("JustBalance").collection("Users").findOne({UserName: username}, function (err, result) {
            if (err) throw err;
            myobj = {DisplayName: result.DisplayName}
            res.json(myobj);
        });
        db.close();
    });
});
app.get('/gettransactions', (req, res) => {
    var userone = req.query.UserOne;
    var usertwo = req.query.UserTwo;
    var array = [];
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        await db.db("JustBalance").collection("Transactions").find({borrower_name: userone, lender_name: usertwo}).toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function(item) {
                array.push(item);
            });
        });
        await db.db("JustBalance").collection("Transactions").find({borrower_name: usertwo, lender_name: userone}).toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function(item) {
                array.push(item);
            });
            res.json(array);
            db.close();
        });
    });
});

app.get('/getusers', (req, res) => {
    var username = req.query.UserName.toLowerCase();
    var array = [];
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        await db.db("JustBalance").collection("Users").find({UserName : {$ne: username}}).toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function(item) {
                array.push({DisplayName: item.DisplayName});
            });
            res.json(array);
        });
        db.close();
    });
});

app.get('/approvefriend', (req, res) => {
    var friendsname = req.query.FriendsName
    var user = req.query.UserName

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const collection = db.db("JustBalance").collection(user);
        collection.updateOne({FriendsName: friendsname}, {$set: {UserApproved: "True"}}, {w:1}, function(err, res){
            if(err) throw err;
            console.log("updated my friends");
            db.close();
        });
    });
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const collection = db.db("JustBalance").collection(friendsname);
        collection.updateOne({FriendsName: user}, {$set: {FriendApproved: "True"}}, {w:1}, function(err, res){
            if(err) throw err;
            console.log("updated their friends");
            db.close();
        });
    });
    res.sendStatus(200);
});

app.get('/getfriends', (req, res) => {
    var user = req.query.UserName;
    var all = req.query.Type;
    var array = [];
    var myobj = {FriendsName: "No one",
                 ApprovedColor: "red",
                 ApprovedString: "Pending No One"}
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        await db.db("JustBalance").collection(user).find({}).toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function(item) {
                if(all == "T")
                {
                    array.push(item);
                }
                else if(all == "L")
                {
                    if(item.UserApproved == "True" && item.FriendApproved == "False")
                    {
                        myobj.FriendsName = item.FriendsName;
                        myobj.ApprovedColor = "yellow";
                        myobj.ApprovedString = "Pending " + item.FriendsName;
                        array.push(myobj);
                    }
                    else if(item.UserApproved == "False" && item.FriendApproved == "True")
                    {
                        myobj.FriendsName = item.FriendsName;
                        myobj.ApprovedColor = "red";
                        myobj.ApprovedString = "Pending " + user;
                        array.push(myobj);
                    }
                    else
                    {
                        myobj.FriendsName = "No one";
                        myobj.ApprovedColor = "red";
                        myobj.ApprovedString = "Pending No One";
                        // dont push
                    }
                    
                }
                else
                {
                    if(item.UserApproved == "True" && item.FriendApproved == "True")
                    {
                        var myobj2  = {DisplayName : item.FriendsName}
                        array.push(myobj2);
                    }
                }
                
            });
            res.json(array);
            db.close();
        });
    });
});


app.listen(8081, () => console.log(`Started server at http://localhost:8081!`));
