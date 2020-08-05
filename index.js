var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({ //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
}));
app.use(express.static(__dirname + '/front' ));

var replayInfo = {}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front/getHTML.html')
})

app.get('/replay', function (req, res) {
    res.sendFile(__dirname + '/front/replay.html')
})

app.post('/record', function (req, res) {
    replayInfo = req.body
    // console.log(replayInfo)
    res.send('ok')
})

app.get('/replayInfo', function(req ,res){
    // let html = replayInfo.html;
    // let css = replayInfo.css;
    // console.log(replayInfo.html)
    res.send(replayInfo)
})



app.listen(3000)