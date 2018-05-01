// Перечисление зависимостей:
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
var path = require('path');
var app = express();

let datafile = fs.readFileSync('database.json');
let database = JSON.parse(datafile);

let orderfile = fs.readFileSync('order.json');
let orders = JSON.parse(orderfile);

let selforderfile = fs.readFileSync('selforders.json');
let selforders = JSON.parse(selforderfile);

let now_about;
//console.log(database);

app.use(fileUpload());
//app.use(express.static(__dirname + '/static'));
app.use(express.static(path.join(__dirname, 'static')));



app.get("/", function(req, res){
	res.sendFile('static/index.html', {root: __dirname})
});
app.get("/pronas", function(req, res){
	res.sendFile('static/pronas.html', {root: __dirname})
});
app.get("/orders", function(req, res){
	if (req.query.login == 'admin' && req.query.password == 'admin1645789') {
    	res.sendFile('static/orders.html', {root: __dirname})
    }
});
app.get("/selforders", function(req, res){

	if (req.query.login == 'admin' && req.query.password == 'admin1645789') {
    	res.sendFile('static/selforders.html', {root: __dirname})
    }

});
app.all("/admin", function(req, res){
	//res.sendFile('static/admin.html', {root: __dirname})
	if (req.query.login == 'admin' && req.query.password == 'admin1645789') {
    	res.sendFile('static/admin.html', {root : __dirname});
    }
});
app.get("/forself", function(req, res){
	res.sendFile('static/forself.html', {root: __dirname})
});
app.get("/dostavka", function(req, res){
	res.sendFile('static/dostavka.html', {root: __dirname})
});
app.get('/about', function(req, res) {
	now_about = database.catalog.filter(function(v) {
		if (v.id == req.query.id) {
			return true;
		}
	})
	res.sendFile('static/about.html', {root: __dirname});
})
app.get('/info', function(req, res) {
	console.log(JSON.stringify(now_about));
	res.json(JSON.stringify(now_about));
})
app.get("/auth", function(req, res) {
	res.sendFile('static/auth.html', {root : __dirname})
});
app.all('/get_auth', function(req, res) {
    if (req.body.login == 'admin' && req.body.password == 'admin1645789') {
    	res.sendFile('static/admin.html', {root : __dirname});
    }
});

app.get("/api", function(req, res) {
	res.json(JSON.stringify(database))
});
app.get("/api/orders", function(req, res) {
	res.json(JSON.stringify(orders))
});
app.get("/api/selforders", function(req, res) {
	res.json(JSON.stringify(selforders))
});

app.post("/api/delete/:goodId", function(req, res) {
	console.log(req.params.goodId);
	database.catalog.splice(req.params.goodId, 1);
	database.lastId -= 1;
	fs.writeFileSync('database.json', JSON.stringify(database));
	res.send('Товар удален! <a class="btn" href="/admin?login=admin&password=admin1645789">НАЗАД!</a>')
});

app.post("/api/orders/delete/:goodId", function(req, res) {
	console.log(req.params.goodId);
	orders.trashbox.splice(req.params.goodId, 1);
	orders.lastId -= 1;
	fs.writeFileSync('order.json', JSON.stringify(orders));
	res.send('Заказ удален!! <a class="btn" href="/orders?login=admin&password=admin1645789">НАЗАД!</a>')
});
app.post("/api/selforders/delete/:goodId", function(req, res) {
	console.log(req.params.goodId);
	selforders.trashbox.splice(req.params.goodId, 1);
	selforders.lastId -= 1;
	fs.writeFileSync('selforders.json', JSON.stringify(selforders));
	res.send('Заказ удален!! <a class="btn" href="/selforders?login=admin&password=admin1645789">НАЗАД!</a>')
});

// путь обработки формы
app.use('/add_good', bodyParser.urlencoded({
    extended: true
}));

app.post('/add_good', function(req, res, next) {
    // Объект req.body содержит данные из переданной формы
    console.dir(req.body);
});

app.post('/add_img', function (req, res) {
	console.log(req.body);
    if (!req.files)
    	return res.status(400).send('No files were uploaded.');
	    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	  let sampleFile = req.files.sampleFile;
	  // Use the mv() method to place the file somewhere on your server
	  console.log(__dirname + '/static/postelnoe'+ database.lastId + '.jpg');
	  sampleFile.mv(__dirname + '/static/postelnoe'+ database.lastId + '.jpg', function(err) {
	    if (err)
	      return res.status(500).send(err);
	 	console.log('File uploaded!');
	 	database.catalog[database.lastId] = req.body;
	 	database.catalog[database.lastId].link = '/postelnoe'+ database.lastId + '.jpg';
	 	database.catalog[database.lastId].id = database.lastId;
	 	database.lastId += 1;
		fs.writeFileSync('database.json', JSON.stringify(database));
	    res.send('Товар загружен! <a class="btn" href="/admin?login=admin&password=admin1645789">НАЗАД</a>');
	  });
});
app.post('/add_order', function (req, res) {
	console.log(req.body);
	var d = new Date();
		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1;
		var curr_year = d.getFullYear();



	 	orders.trashbox[orders.lastId] = req.body;
	 	orders.trashbox[orders.lastId].time = "" + curr_date + "." +  curr_month + "." + curr_year;
	 	orders.lastId += 1;
	 	fs.writeFileSync('order.json', JSON.stringify(orders));
	 	res.sendFile('static/about.html', {root: __dirname});
});

app.post('/add_selforder', function (req, res) {
	console.log(req.body);
	var d = new Date();
		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1;
		var curr_year = d.getFullYear();
	 	selforders.trashbox[selforders.lastId] = req.body;
	 	selforders.trashbox[selforders.lastId].time = "" + curr_date + "." +  curr_month + "." + curr_year;
	 	selforders.lastId += 1;
	 	fs.writeFileSync('selforders.json', JSON.stringify(selforders));
	 	res.sendFile('static/forself.html', {root: __dirname});
});
// начинаем прослушивать подключения на 3000 порту
app.listen(80);
