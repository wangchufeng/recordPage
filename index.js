var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// const { json } = require('express');
app.use(bodyParser.json({
    limit: '1mb'
})); //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({ //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
}));
app.use(express.static(__dirname + '/front'));

var replayInfo = {
    css: '',
    html: [],
    scroll: [],
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front/getHTML.html')
})

app.get('/replay', function (req, res) {
    res.sendFile(__dirname + '/front/replay.html')
})

app.post('/recordScroll', function (req, res) {
    replayInfo.scroll.push(req.body)
    console.log(req.body)
    res.send('ok')
})

app.post('/recordCSS', function (req, res) {
    replayInfo.css = req.body
    // console.log(req.body)
    res.send('ok')
})

app.post('/recordHTML', function (req, res) {
    // console.log(req.body)
    replayInfo.html.push(req.body);
    res.send('ok')
})

app.get('/replayInfo', function (req, res) {
    res.send(replayInfo)
})

app.listen(3000)