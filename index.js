//import packages
var express=require('express');
var ejs=require('ejs');
var path = require('path');
var mysql=require('mysql');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Swal = require('sweetalert');

//create express instance
var app=express();

//initialize variables
var x;
var p;
var bank;
var amount;
let balance;
let sentRow=[];
let sentLength;
let receiveRow=[];
let receiveLength;




// Setting the view engine to EJS for rendering dynamic HTML pages
app.set('view engine', 'ejs');
var publicDir = require('path').join(__dirname,'/Images');

//use static files from publicDir
app.use(express.static(publicDir));

//Use cookie-parser to set cookies in request object
app.use(cookieParser());

//use seesion to handle sessions in app
app.use(session({secret: 'abcd'}));

// Use bodyParser middleware to parse urlencoded request
app.use(bodyParser.urlencoded({extended: true}));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Creating MySQL db connection
var con=mysql.createConnection({
server:'localhost',
port: 3306,
user:'root',
password:'root',
database:'ewal'
});

//connect to db
con.connect(function(error){
if (error) throw error;
console.log("Connected!");
});

//Route Handling
//get requests
//home page
app.get('/',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/home1.ejs'));
});

//login page
app.get('/login',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/login.ejs'));
});

//forgot password page
app.get('/forgot',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/forgot_pass.ejs'));
});

//login landing page
app.get('/home',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/home1.ejs'));  
});

//registration page
app.get('/register',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/register.ejs'));

});

//login post request
app.post('/login1',urlencodedParser,function(req,res){
var email=req.body.email;
var password=req.body.password;
let q = "SELECT * FROM user WHERE UserName=? and UserPswd=?";
let data = [email,password]
let flag = 0

con.query(q, data, (err,result) => {
    console.log(result);
    if (err) 
    throw err;
    
    else if(result.length >0)
    {
        if(result[0].UserPswd == password)
        {
            req.session.user=result[0].userID;
            x=req.session.user;
            flag = 1
            console.log("this is session1 => " + req.session.user)
        }
    }
});

setTimeout(() => {
    if(flag){
        console.log("checked");
        console.log("this is session2 => " + req.session.user)
        res.render('dashboard');
    }
    else
    {
        res.send(500,'Incorrect Information');
    }
}, 100);
    
});

//End current session and land on home page
app.get('/out',function(req,res){
req.session.destroy(function(err) {
    if(err) throw err;
    res.render('home1');
    })
});

app.get('/out1',function(req,res){
req.session.destroy(function(err) {
    if(err) throw err;
    res.render('home1');
    })
});

//User registering page post request
app.post('/register1',urlencodedParser,function(req,res){

var names=req.body.Name;
var mobile=req.body.number;
var UserName=req.body.email;
var UserPswd=req.body.password;
var password1=req.body.password1;

console.log(bank);
if(((mobile>0)&&(mobile.length==10))&&(UserPswd==password1))
{
    let p = "INSERT INTO user VALUES(null,?, ?, ?, ?, ?, ?);"
    let data = [names ,mobile,UserName, UserPswd,bank,amount];
        con.query(p, data, (err,result) => {
    if (err) throw err;
    let q="SELECT userID from user where UserName=?";
    let data1 = [UserName];
    con.query(q,data1,(error,results) => {
        if(error) throw error;
    let r ="INSERT INTO wallet VALUES(?,0);"
    let data2 = [results[0].userID]
        con.query(r,data2,(error,results) => {
        if(error) throw error;
        });
    });
    console.log("Account created");
    res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/login.ejs'));
    });
}
else
{
    res.send(500,'incorrect data');
}
});

//Admin registering page post request
app.post('/register2',urlencodedParser,function(req,res){

var names=req.body.Name;
var UserName=req.body.email;
var password=req.body.password;
var password1=req.body.password1;
if(password==password1)
{
    let p = "INSERT INTO Admin VALUES(null, ?, ?, ?)";
    let data = [names, UserName, password]
        con.query(p, data, (err,result) => {
    if (err) throw err;
    console.log("Account created");
    res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/add_admin.ejs'));
    });
}
else
{
    res.send("Password sholud be same in both the fields");
}
});

//password update page post request
app.post('/givepassword',urlencodedParser,function(req,res){
var mob=req.body.number;
var email=req.body.email;
let q="SELECT UserPswd from user where UserName =? and mobile =?";
let data=[email,mob];
con.query(q,data,(err,result) =>{
    if(err) throw err;
    else
    {
        console.log(result[0].UserPswd);
        res.json(result[0].UserPswd); 
    }
});
});

//User profile page get request 
app.get('/profile',function(req,res){
console.log("this is session1 => " + req.session.user)
let qs = "SELECT * FROM user WHERE userID=" + req.session.user
let row = []  
con.query(qs, (err, result) => {
        if(err) console.error(err)
    row = result
    })
    setTimeout(() => {
    if(row.length > 0){
        res.render('profile',{ "user" : row[0]});
    }
    else{
        res.redirect('/')
    }

}, 100)

});

//wallet page get request
app.get('/wallet',function(req,res){
let user = req.session.user;
let k="SELECT * FROM wallet WHERE WalletID=" + user;
setTimeout(()=>{
    con.query(k,(err,result) =>{
    if(err) throw err;
    balance = result[0].WalletAmount;
})
},100);
let q="SELECT * FROM payment_history WHERE recieverID=" + user;
setTimeout(()=>{
    con.query(q,(err,result) =>{
        if(err) throw err;
        sentRow = result;
        sentLength = result.length
    })
},100);

let c="SELECT * FROM payment_history WHERE senderID=" + user;
setTimeout(()=>{
    con.query(c,(err,result)=>{
        if(err) throw err;
        receiveRow=result;
        receiveLength = result.length
    })
},100);

setTimeout(() => {
    console.log("balance", balance, "sent Row", sentRow, "receive row", receiveRow)
    if((balance >= 0) && (sentLength >= 0) || (receiveLength >= 0)){
        res.render('wallet_dow',{ "balance" : balance, "sentRow" : sentRow, "receiveRow" : receiveRow, "sentLength" : sentLength, "receiveLength" : receiveLength });
    }
    else{
        res.render('dashboard');
    }
}, 150);   
});

//Survey page get request
app.get('/survey1',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/survey.ejs'));

});

//Payment page get request
app.get('/pay',function(req,res){
let user = req.session.user
let q="SELECT WalletAmount FROM wallet WHERE WalletID=" + user;
let row = []
con.query(q,(err,result) =>{
    if(err) throw err;
    row = result
});

setTimeout(() => {
    if(row.length > 0){
        res.render('pay',{ "balancepay" : row[0]})
    }
    else{
        res.render('dashboard')
    }
}, 100);    

});

//Payment page post request
app.post('/payment',function(req,res){
var t;
let user=req.session.user;
var mob=req.body.number;
var money=req.body.money;
let q="select * from user where mobile=?";
let data=[mob];
let row1=[]
con.query(q,data,(error1,result)=>{
    if(error1) throw error1;
row1=result[0];   
});
let ab="SELECT * from user where userID=" + user;
let row= []
con.query(ab,(error,results1)=>{
    if(error) throw error;
    row=results1[0];
    //z=results1[0].mobile;
});
con.beginTransaction(function(err) {
if (err) { throw err; }
con.query("UPDATE wallet SET WalletAmount = WalletAmount+"+money+" WHERE WalletID="+row1.userID+";", function (error, results, fields) {
    if (error) {
    return con.rollback(function() {
        throw error;
    });
    }
    con.query("UPDATE wallet SET WalletAmount = WalletAmount-"+money+" WHERE WalletID="+user +";", function (error, results1, fields) {
    if (error) {
        return con.rollback(function() {
        throw error;
        });
    }
    con.query("INSERT INTO payment_history VALUES(null,?,?,?,?,?,?,?);",[user,row1.User_Id,row.Name,row1.Name,row.mobile,mob,money], function (error, results1, fields) {
        if (error) {
            return con.rollback(function() {
            throw error;
            });
        }
    con.commit(function(err) {
        if (err) {
        return con.rollback(function() {
            throw err;
        });
        }
        console.log('success!');
    });
    res.render('pay',{balancepay : results1[0]});
});
});
});
});

res.render('dashboard');
});

//Dashboard page get request
app.get('/das',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/dashboard.ejs'));

});

//
app.get('/remove',function(req,res){
res.render('remove');
});

//Delete user page get request
app.get('/delete',function(req,res){
var user=req.session.user;
let resu;
let amount;
    let a="select WalletAmount from wallet where WalletID="+user;
        con.query(a,(error,result)=>{
            if(error) throw error;
            resu=result;
            console.log('Amount in wallet1',resu);
        })
        setTimeout(()=>{
            let a="select amount from user where userID="+user;
            con.query(a,(error,result)=>{
            if(error) throw error;
            amount=result;
            console.log('Amount in wallet2',amount);
        })
    },50);
    setTimeout(()=>{
        let q="update user set amount=? where userID="+user;
        let temp=amount+resu;
        let data=[temp];
        con.query(q,data,(error,result1)=>{
            if(error) throw error;
            console.log('Amount in wallet3',result1);
    });
        },100);
    setTimeout(()=>{
        let c="delete from user where userID="+user;
        con.query(c,(error,result2)=>{
            if(error) throw error;
            console.log('Amount in wallet 3',result2);
        });
        
    },150);
    res.render('remove');
});

//Admin login page get request
app.get('/adminlogin',function(req,res){
res.render(path.join('D:/dbms_project-master/dbms_project-master/views'+'/admin_login.ejs'));
});

//Admin login page post request
app.post('/login2',urlencodedParser,function(req,res){

var email=req.body.email;
var password=req.body.password;
let q = "SELECT * FROM Admin WHERE AdminEmail = ? and AdminPswd=?";
let data = [email,password]
let flag = 0
con.query(q, data, (err,result) => {
    if (err) 
        throw err;
    else if(result.length >0)
    {
        if(result[0].AdminPswd == password)
        {
            //p=result[0].userID;
            req.session.user=result[0].AdminID;
            x=req.session.user;
            flag = 1
            console.log("this is session1 => " + req.session.user)
            res.render('homepage');             
        }
        }
        else{
            console.error("Incorrect information!");
            // Swal.fire({
            //     title: 'Are you sure?',
            //     text: "Incorrect information!",
            //     icon: 'warning'
            //   });
            res.redirect('/')
        }
    
});  
});

//Home landing page
app.get('/hp',function(req,res){
res.render('homepage');
});

//Admin profile page get request
app.get('/admin_profile',function(req,res){
let qs = "SELECT * FROM Admin WHERE AdminID=" + req.session.user;
let row = []  ;
con.query(qs, (err, result1) => {
    if(err) throw err;
    row= result1[0];
                        console.log(row);
                        res.render('admin_das',{ "store" : row });
});
});

//Total number of active users(admin view) page get request
app.get('/admin_user',function(req,res){
let ab="SELECT * from user";
let storeuser=[];
let userlength;
//setTimeout(()=> {
    con.query(ab,(error,result)=>{
    if(error) throw error;
    storeuser=result;
    userlength=storeuser.length;
    console.log(storeuser);
    res.render('tot_user',{ "length1" : storeuser, "length2" : userlength });
        });
    // },50);
    
});

//Total number of transactions(admin view) page get request
app.get('/admin_trans',function(req,res){
let q="SELECT * from payment_history";
let row=[];
let rowlength;
con.query(q,(error,result)=>{
    if(error) throw error;
    row=result;
    rowlength=result.length;
    console.log(row);
    res.render('tot_trans',{"length3" : row, "length4" : rowlength });
});

});

//Bank get requests
app.get('/axis',function(req,res){

bank="Axis Bank";
amount="1000";
});

app.get('/sbi',function(req,res){

bank="State Bank of India";
amount="1500";
});

app.get('/syn',function(req,res){

bank="Syndicate Bank";
amount="900";
});

app.get('/can',function(req,res){

bank="Canara Bank";
amount="1500";
});

app.get('/kar',function(req,res){

bank="Karnataka Bank";
amount="2000";
});

//Add money to user wallet page post request
app.post('/addmoney', urlencodedParser,function(req,res){
let user = req.session.user;
var money=req.body.money;
if(money>0){
console.log("This is incoming money", money)
let m="SELECT * FROM wallet WHERE WalletID=" + user;
let amount;
let amount1;
con.query(m,(err,result) =>{
    if(err) throw err;
    amount= result[0].WalletAmount;
})

    setTimeout(()=>{
    let pt="SELECT * FROM user WHERE userID=" + user;
        con.query(pt,(err,result) =>{
        if(err) throw err;
        amount1= result[0].amount;
    console.log('These are amount ', amount, amount1)
    })
    },50);
let balance1;
setTimeout(()=>{
if((money<=amount1)&&(amount1>0))
{
//setTimeout(()=>{
    let p="update user set amount= ? where userID="+user;
    let data1=[Number(amount1)-Number(money)]
    con.query(p,data1,(error,result)=>{
        if(error) throw error;
        console.log("This is data1 ", data1)
})
// },100);
    setTimeout(()=>{
    let t="update wallet set WalletAmount= ? where WalletID="+user;
    let temp = Number(amount)+Number(money)
    console.log("This is temp", temp)
    let data=[temp]
        con.query(t,data,(error,result)=>{
        if(error) throw error;
        console.log("This is data ", data)
    })
},150);
    res.redirect('/wallet');
    }
    else
    {
        res.send("Your bank account has:"+ amount1);
    }

},100);
}
});

//Survey page get request
app.get('/surveysubmit',function(req,res){
let b;
var c=50;
var user=req.session.user;
let p="select * from wallet where WalletID="+user;
    con.query(p,(error,result)=>{
    if(error) throw error;
    b=result[0].WalletAmount;
    console.log("Tamount ",b);
    console.log("Total after reward",b+50);
});

    setTimeout(()=>{
        let x="update wallet set WalletAmount= ? where WalletID="+user;
        let data=[b+50];
        con.query(x,data,(error,results1)=>{
            if(error) throw error;      
        });
    },50);
res.render('dashboard');
});

//Gift cards get requests 
app.get('/amazon',function(req,res){
res.redirect('https://www.amazon.in')
});

app.get('/flipkart',function(req,res){
res.redirect('https://www.flipkart.com')
});

app.get('/pepper',function(req,res){
res.redirect('https://www.pepperfry.com')
});

app.get('/bigbasket',function(req,res){
res.redirect('https://www.bigbasket.com')
});

app.listen(8000,function(){
    console.log('listening to server 8000 ');
 });
