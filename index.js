var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({ //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
}));

app.use(express.static(__dirname + '/front' ));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front/getHTML.html')
})

app.post('/record', function (req, res) {
    // var event = req.body
    console.log(req.body)
    res.send('ok')
})
app.listen(3000)