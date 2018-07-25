﻿// Application Log
var log4js = require('log4js');
var log4js_extend = require('log4js-extend');
log4js_extend(log4js, {
    path: __dirname,
    format: '(@file:@line:@column)'
});
log4js.configure(__dirname + '/log4js.json');
var logger = log4js.getLogger('bot');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hashtable = require(__dirname + '/hashtable.js');


// Setup Express Server
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    next();
});

var config = require('fs').readFileSync(__dirname + '/config.json');
config = JSON.parse(config); //字串轉物件

app.get('/api', function (request, response) {
    response.send('API is running');
    console.log('API is running');
});

app.get('/linemap', function (request, response) {
    response.redirect('line://nv/location');
    /*logger.info('___________________________________________________________/linemap');
    logger.info(request.body);
    var results = request.body.events;
    logger.info(JSON.stringify(results));
    logger.info('緯度: '+results.latitude);
    logger.info('經度: '+results.longitude);*/
});

app.get('/lifftest', function (request, response) {
    console.log('GET /lifftest');
    request.header("Content-Type", 'text/html');
    var fs = require('fs');
    fs.readFile(__dirname + '/lifftest.html', 'utf8', function (err, data) {
        if (err) {
            res.send(err);
        }
        this.res.send(data);
    }.bind({ req: request, res: response }));
});

app.get('/tatunglogin', function (request, response) {
    console.log('GET /tatunglogin');
    var linkToken = "";
    if (request.query.linkToken) {
        linkToken = request.query.linkToken;
    }
    request.header("Content-Type", 'text/html');
    var fs = require('fs');
    fs.readFile(__dirname + '/tatunglogin.html', 'utf8', function (err, data) {
        if (err) {
            res.send(err);
        }
        data = data + '<script type="text/javascript"> var linkToken = " ' + linkToken + ' ";</script>';
        this.res.send(data);
    }.bind({ req: request, res: response }));
});

app.get('/mylifftest', function (request, response) {
    console.log('GET /mylifftest');
    request.header("Content-Type", 'text/html');
    var fs = require('fs');
    fs.readFile(__dirname + '/mytest.html', 'utf8', function (err, data) {
        if (err) {
            res.send(err);
        }
        this.res.send(data);
    }.bind({ req: request, res: response }));
});

app.post('/getlineuserid', function (request, response) {
    console.log('post /getlineuserid');
    var userId = request.body.userId;
    console.log(userId);
    response.send('200');
    postlinktoken(userId);
});

app.get('/logs', function (request, response) {
    var stream = require('fs').createReadStream('logs/messaging.log');
    stream.pipe(response);
});

app.post('/messages', function (request, response) {
    response.send('');
    logger.info(request.body);
    var results = request.body.events;
    logger.info(JSON.stringify(results));
    logger.info('receive message count: ' + results.length);
    for (var idx = 0; idx < results.length; idx++) {
        var acct = results[idx].source.userId;
        var reply_token = results[idx].replyToken;
        logger.info('reply token: ' + results[idx].replyToken);
        logger.info('createdTime: ' + results[idx].timestamp);
        logger.info('from: ' + results[idx].source.userId);
        logger.info('type: ' + results[idx].type);
        if (results[idx].type == 'message') {
            if (results[idx].message.type == 'text') {
                /*SendMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
                SendMessage(acct, 'line://app/1593612875-NwM4kER7', 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
                SendBubbleMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
                SendCarouselMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
                SendMessage(acct, 'line://app/1593612875-yavQm3XY', 'tstiisacompanyfortatung', reply_token, function (ret) {
                });*/

                if (results[idx].message.text == '會員綁定作業中，請稍後!') {
                    IssuelinkToken(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else if (results[idx].message.text == '解除') {
                    UnlinkrichmenuUsers(acct, 'tstiisacompanyfortatung');
                } else {
                    SendLinePayMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                    distance();
                }
            } else if (results[idx].message.type == 'location') {
                logger.info('緯度: ' + results[idx].message.latitude);
                logger.info('經度: ' + results[idx].message.longitude);
                /*104台北市中山區104台北市中山區中山北路三段13號
                25.064258, 121.522554 
                台北市103大同區重慶北路二段174-2號
                25.059610, 121.513416
                106台北市大安區復興南路一段158號
                25.042231, 121.543548
                */
                SendUrlPayMessage(acct, results[idx].message, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
            }
        } else if (results[idx].type == 'accountLink') {
            /*SendMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });*/
            if (results[idx].link.result == 'ok') {
                SendMessage(acct, '會員綁定成功!', 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
                LinkrichmenuUsers(acct, 'tstiisacompanyfortatung');
            } else if (results[idx].link.result == 'failed') {
                SendMessage(acct, '會員綁定作業失敗', 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
            }

        }
    }
});

app.post('/postmember', function (request, response) {
    console.log('post /postmember');
    var email = request.body.email;
    var password = request.body.password;
    var linkToken = request.body.linkToken;
    var linkTokenreplace = linkToken.replace(' ', '');//因為得到的linkToken左右會有空格，須把空格拿掉才能redirect
    linkToken = linkTokenreplace.replace(' ', ''); //去掉右邊的空格
    var nonce = new Date().getTime();
    var httpurl = "https://access.line.me/dialog/bot/accountLink?linkToken=" + linkToken + "&nonce=" + nonce;
    console.log('nonce: ' + nonce);
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^linkToken:' + linkToken);
    console.log(httpurl);
    try {
        console.log(httpurl);
        response.send({ redirect: httpurl });
    } catch (err) {
        console.log(err);
        response.end('fail');
    }
    //response.end('OK');
});

var http = require('http');
var server = http.Server(app);	// create express server
var options = {
    pingTimeout: 60000,
    pingInterval: 3000
};
var listener = server.listen(process.env.port || process.env.PORT || 3978, function () {
    logger.info('Server listening to ' + listener.address().port);
});

process.on('uncaughtException', function (err) {
    logger.error('uncaughtException occurred: ' + (err.stack ? err.stack : err));
});

class build_tatung3c {
    constructor(lat, lng, name, address) {
        this.pos = {
            lat: lat,
            lng: lng,
            dis: 2147483647
        },
            this.bubble = {
                "type": "bubble",
                "hero": {
                    "type": "image",
                    "url": "https://www.esunbank.com.tw/bank/-/media/esunbank/images/home/personal/discount/shops/0011.jpg?h=240&la=en&mh=240&mw=240&w=240",
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "cover",
                    "action": {
                        "type": "uri",
                        "uri": "http://tcpc.tatung.com/"
                    }
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": name,
                            "weight": "bold",
                            "size": "xl"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "地址: ",
                                            "color": "#444444",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": address,
                                            "wrap": true,
                                            "color": "#666666",
                                            "size": "sm",
                                            "flex": 5
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "距離: ",
                                            "color": "#444444",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": "10.24km",
                                            "wrap": true,
                                            "color": "#666666",
                                            "size": "sm",
                                            "flex": 5
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "button",
                            "style": "link",
                            "height": "sm",
                            "action": {
                                "type": "uri",
                                "label": "WEBSITE",
                                "uri": "http://tcpc.tatung.com/"
                            }
                        },
                        {
                            "type": "spacer",
                            "size": "sm"
                        }
                    ],
                    "flex": 0
                }
            }
    }
}

var tatung3c = [
    new build_tatung3c(25.064258, 121.522554, "台北中山門市", "台北市104中山區中山北路三段13號1樓"),
    new build_tatung3c(25.059610, 121.513416, "台北重慶北門市", "台北市103大同區重慶北路二段174-2、3號"),
    new build_tatung3c(25.042231, 121.543548, "台北復南門市", "台北市106大安區復興南路一段158")
];

function distance(o, d) {
    var EARTH_RADIUS = 6378137.0;
    var lat1 = o.lat * Math.PI / 180.0;
    var lat2 = d.lat * Math.PI / 180.0;
    var a = lat1 - lat2;
    var b = (o.lng - d.lng) * Math.PI / 180.0;
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(b / 2), 2))) * EARTH_RADIUS;
    dis = Math.round(dis * 10000) / 10000;
    return dis;
}

function SendUrlPayMessage(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var location = {
            lat: message.latitude,
            lng: message.longitude
        }
        //算距離
        for (let i = 0; i < tatung3c.length; i++) {
            tatung3c[i].pos.dis = distance(location, tatung3c[i].pos);
        }
        //排序
        tatung3c.sort(function (a, b) {
            return a.pos.dis - b.pos.dis;
        });
        //更新
        for (let i = 0; i < tatung3c.length; i++) {
            tatung3c[i].bubble.body.contents[1].contents[1].contents[1].text = "" + tatung3c[i].pos.dis + " m";
            tatung3c[i].bubble.footer.contents[0].action.uri = "https://www.google.com.tw/maps/dir/" + location.lat + "," + location.lng + "/" + tatung3c[i].pos.lat + "," + tatung3c[i].pos.lng + "/@" + location.lat + "," + location.lng + "z";
        }
        var data = {
            'to': userId,
            'messages': [
                {
                    "type": "flex",
                    "altText": "this is a flex message",
                    "contents": {
                        "type": "carousel",
                        "contents": [
                            tatung3c[0].bubble,
                            tatung3c[1].bubble,
                            tatung3c[2].bubble
                        ]
                    }
                }
            ]
        };
        logger.info('傳送訊息給 ' + userId);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }))
    } else {
        callback(false);
    }
}

function postlinktoken(userId) {
    console.log('postlinktoken:  ' + userId);
};

function IssuelinkToken(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        //Issue linkToken
        logger.info('userId: ' + userId);
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/v2/bot/user/' + userId + '/linkToken',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer <' + config.channel_access_token + '>'
            }
        }
        var https = require('https');
        var req = https.request(options, function (res) {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            var linkToken_chunk = '';
            res.on('data', function (chunk) {
                console.log('chunk: ' + chunk);
                console.log('chunk typeof: ' + typeof (chunk));
                linkToken_chunk += chunk;
            });
            res.on('end', function () {
                var linkToken = JSON.parse(linkToken_chunk);
                console.log(typeof (linkToken));
                SendLinkingUrl(userId, linkToken, 'tstiisacompanyfortatung');
            });
        });
        req.end();
    }
};
function SendLinkingUrl(userId, linkToken, password) {
    if (password == 'tstiisacompanyfortatung') {
        console.log('linkToken: ' + linkToken);
        console.log(typeof (linkToken));
        console.log(typeof (linkToken.linkToken));
        console.log('linkToken.linkToken: ' + linkToken.linkToken);
        /*var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': '進行會員綁定',
                'template': {
                    'type': 'buttons',
                    'text': '登入e同購',
                    'actions': [{
                        "type": 'uri',
                        'label': '登入e同購進行會員綁定',
                        'uri': 'https://tatungloginaccount.herokuapp.com/tatunglogin?linkToken=' + linkToken.linkToken
                    }]
                }
            }]
        }*/
        var data = {
            'to': userId,
            'messages': [{
                "type": "flex",
                "altText": "e同購會員綁定",
                "contents": {
                    "type": "bubble",
                    "hero": {
                        "type": "image",
                        "url": "https://pgw.udn.com.tw/gw/photo.php?u=https://uc.udn.com.tw/photo/2017/07/05/99/3719993.jpg&x=0&y=0&sw=0&sh=0&sl=W&fw=400",
                        "size": "5xl",
                        "aspectRatio": "16:9",
                        "aspectMode": "fit",
                        "action": {
                            "type": "uri",
                            "uri": "https://tatungloginaccount.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                        }
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "md",
                        "action": {
                            "type": "uri",
                            "uri": "https://tatungloginaccount.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                        },
                        "contents": [
                            {
                                "type": "text",
                                "text": "e同購會員綁定",
                                "size": "xl",
                                "weight": "bold",
                                "action": {
                                    "type": "uri",
                                    "uri": "https://tatungloginaccount.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                                },
                            },
                            {
                                "type": "text",
                                "text": "請點選下方按鈕進行e同購會員綁定",
                                "wrap": true,
                                "color": "#aaaaaa",
                                "size": "md",
                                "action": {
                                    "type": "uri",
                                    "uri": "https://tatungloginaccount.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                                },
                            }
                        ]
                    },
                    "footer": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "spacer",
                                "size": "xxl"
                            },
                            {
                                "type": "button",
                                "style": "primary",
                                "color": "#905c44",
                                "action": {
                                    "type": "uri",
                                    "label": "點我進行綁定",
                                    "uri": "https://tatungloginaccount.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                                }
                            }
                        ]
                    }
                }//contents end
            }]
        }
        logger.info('傳送訊息給 ' + userId);
        logger.info('SendLinkingUrl 的 data: ' + JSON.stringify(data));
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/v2/bot/message/push',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Content-Length': Buffer.byteLength(JSON.stringify(data)),
                'Authorization': 'Bearer <' + config.channel_access_token + '>'
            }
        }
        var https = require('https');
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                logger.info('Response: ' + chunk);
            });
        });
        req.write(JSON.stringify(data));
        req.end();
        try {
            callback(true);
        } catch (e) { };
    }
};

function LinkrichmenuUsers(userId, password) {
    if (password == 'tstiisacompanyfortatung') {
        logger.info('LinkrichmenuUsers, userId: ' + userId);
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/v2/bot/user/' + userId + '/richmenu/' + config.rich_menu_id,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer <' + config.channel_access_token + '>'
            }
        }
        var https = require('https');
        var req = https.request(options, function (res) {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            if (res.statusCode == 200) {
                console.log('Link to rich menu success');
            } else {
                console.log('Link to rich menu fail');
            }
        });
        req.end('end');
    }
};
function UnlinkrichmenuUsers(userId, password) {
    if (password == 'tstiisacompanyfortatung') {
        logger.info('userId: ' + userId);
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/v2/bot/user/' + userId + '/richmenu',
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer <' + config.channel_access_token + '>'
            }
        }
        var https = require('https');
        var req = https.request(options, function (res) {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            if (res.statusCode == 200) {
                console.log('Unlink to rich menu success');
            } else {
                console.log('Unlink to rich menu fail');
            }
        });
        req.end('end');
    }
};

// 傳送訊息給 LINE 使用者
function SendLinePayMessage(userId, message, password, reply_token, callback) {
    var date = new Date();
    var gmt = parseInt(date.getTimezoneOffset() > 0 ? "-" : "+" + (date.getTimezoneOffset() + 480 / 60));
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    var hour = (date.getHours() + gmt).toString();
    var min = date.getMinutes().toString();
    var today = year + "." + month + "." + day + " " + hour + ":" + min + " (GMT + 0800)";
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                {
                    "type": "flex",
                    "altText": "this is a flex message",
                    "contents":
                    {
                        "type": "bubble",
                        "styles": {
                            "footer": {
                                "separator": true
                            }
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "付款",
                                    "weight": "bold",
                                    "color": "#1DB446",
                                    "size": "sm"
                                },
                                {
                                    "type": "text",
                                    "text": "NT$ 54",
                                    "weight": "bold",
                                    "size": "xxl",
                                    "margin": "md"
                                },
                                {
                                    "type": "text",
                                    "text": "LINE PAY",
                                    "weight": "bold",
                                    "size": "md",
                                    "margin": "md"
                                },
                                {
                                    "type": "text",
                                    "text": today,
                                    "size": "xs",
                                    "color": "#aaaaaa",
                                    "wrap": true
                                },
                                {
                                    "type": "text",
                                    "text": "付款完成。",
                                    "weight": "bold",
                                    "size": "xl",
                                    "wrap": true
                                },
                                {
                                    "type": "separator",
                                    "margin": "xxl"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "margin": "xxl",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "商店名稱",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                    "flex": 0
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "全家便利商店",
                                                    "weight": "bold",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "text",
                                            "text": "1",
                                            "weight": "bold",
                                            "size": "sm",
                                            "color": "#ffffff"
                                        },
                                        {
                                            "type": "text",
                                            "text": "指定消費為排除繳稅、超商、全聯、分期等無法回饋LINE Points點數的消費。【完整不回饋消費項目清單，請參閱下方連結】LINE Pay聯名卡2%點數回饋資格將依中國信託LINE Pay聯名卡回饋計畫為準。【謹慎理財信用至上】信用卡循環年利率=中國信託ARMs+5.97%起，上限15%",
                                            "size": "sm",
                                            "color": "#555555",
                                            "wrap": true
                                        }
                                    ]
                                },
                                {
                                    "type": "separator",
                                    "margin": "xxl"
                                },
                                {
                                    "type": "text",
                                    "text": "聯絡中國信託",
                                    "size": "xl",
                                    "color": "#000077",
                                    "wrap": true
                                }
                            ]
                        }
                    }
                }
            ]
        };
        logger.info('傳送訊息給 ' + userId);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送訊息給 LINE 使用者
function SendCarouselMessage(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                {
                    "type": "flex",
                    "altText": "this is a flex message",
                    "contents": {
                        "type": "carousel",
                        "contents": [
                            {
                                "type": "bubble",
                                "hero": {
                                    "type": "image",
                                    "size": "full",
                                    "aspectRatio": "20:13",
                                    "aspectMode": "cover",
                                    "url": "https://www.etungo.com.tw/files/TC_PSpec/PS_Pic/WT-D176VG.jpg"
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "LG樂金 高效率變頻洗衣機17KG (WT-D176VG)",
                                            "wrap": true,
                                            "weight": "bold",
                                            "size": "xl"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "spacing": "sm",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "促銷商品",
                                                            "weight": "bold",
                                                            "margin": "sm",
                                                            "flex": 0
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": "2018/7/1~2018/7/31",
                                                            "size": "sm",
                                                            "align": "end",
                                                            "color": "#aaaaaa"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "促銷價",
                                                            "weight": "bold",
                                                            "margin": "sm",
                                                            "flex": 0
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": "20,990元",
                                                            "size": "sm",
                                                            "align": "end",
                                                            "color": "#aaaaaa"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "․TURBOSHOT潔勁噴射",
                                                    "wrap": true,
                                                    "color": "#aaaaaa",
                                                    "size": "xxs"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "․TURBOWASH勁速洗",
                                                    "wrap": true,
                                                    "color": "#aaaaaa",
                                                    "size": "xxs"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "․TURBOWASH勁速洗",
                                                    "wrap": true,
                                                    "color": "#aaaaaa",
                                                    "size": "xxs"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": ".6MOTION DD SMART媽媽手洗",
                                                    "wrap": true,
                                                    "color": "#aaaaaa",
                                                    "size": "xxs"
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "․NFC雲端客製洗衣行程",
                                                    "wrap": true,
                                                    "color": "#aaaaaa",
                                                    "size": "xxs"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "spacer",
                                            "size": "xxl"
                                        },
                                        {
                                            "type": "button",
                                            "style": "primary",
                                            "color": "#905c44",
                                            "action": {
                                                "type": "uri",
                                                "label": "登入e同購",
                                                "uri": "https://www.etungo.com.tw/login.html"
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "type": "bubble",
                                "hero": {
                                    "type": "image",
                                    "url": "https://www.etungo.com.tw/files/TC_PSpec/PS_Pic/TAW-A150Ls.jpg",
                                    "size": "full",
                                    "aspectRatio": "20:13",
                                    "aspectMode": "cover",
                                    "action": {
                                        "type": "uri",
                                        "uri": "https://www.etungo.com.tw/inside/377/722/728/60127.html"
                                    }
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "md",
                                    "action": {
                                        "type": "uri",
                                        "uri": "https://linecorp.com"
                                    },
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "TATUNG大同 15KG定頻洗衣機 (TAW-A150L)",
                                            "size": "xl",
                                            "weight": "bold"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "spacing": "sm",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "促銷商品",
                                                            "weight": "bold",
                                                            "margin": "sm",
                                                            "flex": 0
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": "2018/6/29~2018/7/11",
                                                            "size": "sm",
                                                            "align": "end",
                                                            "color": "#aaaaaa"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "促銷價",
                                                            "weight": "bold",
                                                            "margin": "sm",
                                                            "flex": 0
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": "15,490元",
                                                            "size": "sm",
                                                            "align": "end",
                                                            "color": "#aaaaaa"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            "type": "text",
                                            "text": ".全自動NEURO & FUZZLY智慧型控制",
                                            "wrap": true,
                                            "color": "#aaaaaa",
                                            "size": "xxs"
                                        },
                                        {
                                            "type": "text",
                                            "text": ".6種洗衣行程(標準、強洗、快洗、柔洗、毛毯、浸泡)",
                                            "wrap": true,
                                            "color": "#aaaaaa",
                                            "size": "xxs"
                                        },
                                        {
                                            "type": "text",
                                            "text": ".五道立體噴射水流，洗淨力超強",
                                            "wrap": true,
                                            "color": "#aaaaaa",
                                            "size": "xxs"
                                        },
                                        {
                                            "type": "text",
                                            "text": ".Air Bubble洗淨新概念",
                                            "wrap": true,
                                            "color": "#aaaaaa",
                                            "size": "xxs"
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "spacer",
                                            "size": "xxl"
                                        },
                                        {
                                            "type": "button",
                                            "style": "primary",
                                            "color": "#905c44",
                                            "action": {
                                                "type": "uri",
                                                "label": "登入e同購",
                                                "uri": "https://www.etungo.com.tw/login.html"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    } //contents end
                }
            ]
        };
        logger.info('傳送訊息給 ' + userId);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送訊息給 LINE 使用者
function SendBubbleMessage(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                {
                    "type": "flex",
                    "altText": "this is a flex message",
                    "contents": {
                        "type": "bubble",
                        "hero": {
                            "type": "image",
                            "url": "https://www.etungo.com.tw/files/TC_PSpec/PS_Pic/TAW-A150Ls.jpg",
                            "size": "full",
                            "aspectRatio": "20:13",
                            "aspectMode": "cover",
                            "action": {
                                "type": "uri",
                                "uri": "https://www.etungo.com.tw/inside/377/722/728/60127.html"
                            }
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "md",
                            "action": {
                                "type": "uri",
                                "uri": "https://linecorp.com"
                            },
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "TATUNG大同 15KG定頻洗衣機 (TAW-A150L)",
                                    "size": "xl",
                                    "weight": "bold"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "baseline",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "促銷商品",
                                                    "weight": "bold",
                                                    "margin": "sm",
                                                    "flex": 0
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "2018/6/29~2018/7/11",
                                                    "size": "sm",
                                                    "align": "end",
                                                    "color": "#aaaaaa"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "baseline",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "促銷價",
                                                    "weight": "bold",
                                                    "margin": "sm",
                                                    "flex": 0
                                                },
                                                {
                                                    "type": "text",
                                                    "text": "15,490元",
                                                    "size": "sm",
                                                    "align": "end",
                                                    "color": "#aaaaaa"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "text",
                                    "text": ".全自動NEURO & FUZZLY智慧型控制",
                                    "wrap": true,
                                    "color": "#aaaaaa",
                                    "size": "xxs"
                                },
                                {
                                    "type": "text",
                                    "text": ".6種洗衣行程(標準、強洗、快洗、柔洗、毛毯、浸泡)",
                                    "wrap": true,
                                    "color": "#aaaaaa",
                                    "size": "xxs"
                                },
                                {
                                    "type": "text",
                                    "text": ".五道立體噴射水流，洗淨力超強",
                                    "wrap": true,
                                    "color": "#aaaaaa",
                                    "size": "xxs"
                                },
                                {
                                    "type": "text",
                                    "text": ".Air Bubble洗淨新概念",
                                    "wrap": true,
                                    "color": "#aaaaaa",
                                    "size": "xxs"
                                }
                            ]
                        },
                        "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "spacer",
                                    "size": "xxl"
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "color": "#905c44",
                                    "action": {
                                        "type": "uri",
                                        "label": "登入e同購",
                                        "uri": "https://www.etungo.com.tw/login.html"
                                    }
                                }
                            ]
                        }
                    } //contents end
                }
            ]
        };
        logger.info('傳送訊息給 ' + userId);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送訊息給 LINE 使用者
function SendMessage(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                { 'type': 'text', 'text': message }
            ]
        };
        logger.info('傳送訊息給 ' + userId);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送[可點選圖片]給 LINE 使用者
function SendImagemap(userId, baseUrl, altText, imagemap, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [{
                "type": "imagemap",
                "baseUrl": baseUrl,
                "altText": altText,
                "baseSize": {
                    "height": 693,
                    "width": 1040
                },
                "actions": imagemap
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        logger.info('傳送圖片網址: ' + baseUrl);
        /*ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (!ret) {
                PostToLINE(data, config.channel_access_token, this.callback);
            } 
        });*/
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}
// 傳送【選單】給 LINE 使用者
function SendButtons(userId, image_url, title, text, buttons, alt_text, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': alt_text,
                'template': {
                    'type': 'buttons',
                    'thumbnailImageUrl': image_url,
                    'title': title,
                    'text': text,
                    'actions': buttons
                }
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送【確認】給 LINE 使用者
function SendConfirm(userId, text, buttons, alt_text, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': alt_text,
                'template': {
                    'type': 'confirm',
                    'text': text,
                    'actions': buttons
                }
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 傳送【可滾動選單】給 LINE 使用者
function SendCarousel(userId, columns, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [{
                'type': 'template',
                'altText': '請至行動裝置檢視訊息',
                'template': {
                    'type': 'carousel',
                    'columns': columns
                }
            }]
        };
        logger.info('傳送訊息給 ' + userId);
        ReplyMessage(data, config.channel_access_token, reply_token, function (ret) {
            if (ret) {
                this.callback(true);
            } else {
                PostToLINE(data, config.channel_access_token, this.callback);
            }
        }.bind({ callback: callback }));
    } else {
        callback(false);
    }
}

// 直接回覆訊息給 LINE 使用者
function ReplyMessage(data, channel_access_token, reply_token, callback) {
    data.replyToken = reply_token;
    logger.info(JSON.stringify(data));
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/bot/message/reply',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Content-Length': Buffer.byteLength(JSON.stringify(data)),
            'Authorization': 'Bearer <' + channel_access_token + '>'
        }
    };
    var https = require('https');
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
        });
        res.on('end', function () {
        });
        logger.info('Reply message status code: ' + res.statusCode);
        if (res.statusCode == 200) {
            logger.info('Reply message success');
            this.callback(true);
        } else {
            logger.info('Reply message failure');
            this.callback(false);
        }
    }.bind({ callback: callback }));
    req.write(JSON.stringify(data));
    req.end();
}

// 取得 LINE 使用者資訊
function GetProfile(userId, callback) {
    var https = require('https');
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/bot/profile/' + userId,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer <' + config.channel_access_token + '>'
        }
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            if (res.statusCode == 200) {
                var result = JSON.parse(chunk);
                logger.info('displayName: ' + result.displayName);
                logger.info('userId: ' + result.userId);
                logger.info('pictureUrl: ' + result.pictureUrl);
                logger.info('statusMessage: ' + result.statusMessage);
                callback(result);
            } if (res.statusCode == 401) {
                logger.info('IssueAccessToken');
                IssueAccessToken();
            }
        });
    }).end();
}

function PostToLINE(data, channel_access_token, callback) {
    logger.info(JSON.stringify(data));
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/bot/message/push',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Content-Length': Buffer.byteLength(JSON.stringify(data)),
            'Authorization': 'Bearer <' + channel_access_token + '>'
        }
    };
    var https = require('https');
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
        });
    });
    req.write(JSON.stringify(data));
    req.end();
    try {
        callback(true);
    } catch (e) { };
}
function IssueAccessToken() {
    var https = require('https');
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/v2/oauth/accessToken',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    options.form = {};
    options.form.grant_type = 'client_credentials';
    options.form.client_id = config.channel_id;
    options.form.client_secret = config.channel_secret;

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            if (res.statusCode == 200) {
                var result = JSON.parse(chunk);
                config.channel_access_token = result.access_token;
                var fs = require('fs');
                fs.writeFile(__dirname + '/config.json', JSON.stringify(config), function (err) {
                    if (err) {
                        logger.error(e);
                    }
                });
            }
        });
    }).end();
}