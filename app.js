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
var sha256 = require('sha256'); // sha256

var nodejieba = require("nodejieba");
var nodejiebatagstring = nodejieba.tag("红掌拨清波");
console.log(typeof(nodejiebatagstring))
console.log(nodejiebatagstring);
for(var i in nodejiebatagstring){
    if(nodejiebatagstring[i].tag == 'v'){
        console.log(nodejiebatagstring[i].word);
    }
}

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

var carous = require('fs').readFileSync(__dirname + '/carousel.json');
carous = JSON.parse(carous); //字串轉物件

var gift = require(__dirname + '/gift.js');

var linequickreply = require('fs').readFileSync(__dirname + '/linequickreply.json');
linequickreply = JSON.parse(linequickreply); //字串轉物件
var quickreply = require('fs').readFileSync(__dirname + '/quickreply.json');
quickreply = JSON.parse(quickreply); //字串轉物件

app.get('/api', function (request, response) {
    response.send('API is running');
    console.log('API is running');
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
    var displayName = request.body.displayName;
    var pictureUrl = request.body.pictureUrl;
    //console.log("1 " + userId);
    //console.log("2 " + displayName);
    //console.log("3 " + pictureUrl);
    response.send('200');
    SendGiftMessage(request.body, 'tstiisacompanyfortatung');
});

app.get('/logs', function (request, response) {
    var stream = require('fs').createReadStream('logs/messaging.log');
    stream.pipe(response);
});
var useremail = 0;
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
                if (results[idx].message.text == '大同寶寶，我想要加入LINE個人服務!') {
                    IssuelinkToken(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else if (results[idx].message.text == '大同寶寶，我想要解除LINE個人服務!') {
                    UnlinkrichmenuUsers(acct, 'tstiisacompanyfortatung', reply_token);
                } else if (results[idx].message.text == '大同寶寶，我想要看特價商品') {
                    SendflexMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else if (results[idx].message.text == '大同寶寶') {
                    //SendflexMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    //});
                    //SendQuickReplies(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    //});
                    GetUserRichMenuId(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else if (results[idx].message.text == '大同寶寶，我想查看大同同樂會主頁') {
                    SendURI(acct, '查看大同同樂會主頁', 'line://home/public/main?id=rea8658u', 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else if (results[idx].message.text == '大同寶寶，我想推薦大同同樂會給好友') {
                    SendURI(acct, '推薦大同同樂會給好友', 'line://nv/recommendOA/@rea8658u', 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else if (results[idx].message.text == 'LINEPAY') {
                    SendLinePayMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                } else {
                    SendMessage(acct, '嗨!我是大同寶寶，如果有任何需求，可點選下面選單，讓我協助您。', 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
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
            } else if (results[idx].message.type == 'image') {
                var image_id = JSON.stringify(results[idx].message.id);
                image_id = image_id.replace('"','').replace('"','');
                console.log(image_id);
                var url = "";
                var options = {
                    host: 'api.line.me',
                    port: '443',
                    path: '/v2/bot/message/' + image_id + '/content',
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer <' + config.channel_access_token + '>'
                    }
                };
                var https = require('https');
                https.get(options, (response) => {

                    var result = new Buffer('');
                    response.on('data', function (chunk) {
                        result = Buffer.concat([result, new Buffer(chunk)]);
                    });
                
                    response.on('end', function () {
                        /*var fs = require('fs');
                        let binaryData = new Buffer(result.toString('binary'), 'binary');
                        fs.writeFile(__dirname + '\\image.png', binaryData);*/
                        console.log('endx');
                        var binaryData = new Buffer(result.toString('binary'), 'binary');
                        var request = require("request");
                        var options = {
                            url: 'https://tsti-qa-blob-storage.azurewebsites.net/attachment/binary/qbe',
                            method: 'POST',
                            headers: {
                                'filename': image_id+'.jpg'
                            },
                            body:binaryData
                        };
                        request(options, function (error, response, body) {
                            if (error) throw new Error(error);//
                            var parsetoJson = JSON.parse(body);
                            var blobName = parsetoJson.blobName;
                            url = 'https://tsti-qa-blob-storage.azurewebsites.net/attachment/download/qbe/'+blobName;
                            console.log(url);
                            var req = require("request");
                            var options = {
                                url: 'https://tsticomputervisionocrapp.azurewebsites.net/api/OcrOnline?key=87978a6ac7554c11ac65d5a460d3ed39',
                                method: 'POST',
                                headers: {
                                    'x-functions-key': 'WXFunMe4piO3z/9ed0TlGS8nsfzpEIcVwxonYGKwGacH4KncUhl6Cg=='
                                },
                                body:url
                            };
                            req(options, function (error, response, body) {
                                if (error) throw new Error(error);
                                var text_to_Json = JSON.parse(body);
                                console.log(body);
                                /*var regions = text_to_Json.regions;
                                //console.log(regions.length);
                                //console.log(regions);
                                var all_text = '';
                                var line_text='';
                                var email='';
                                var mobilephone = '';
                                var tel = '';
                                var fax = '';
                                var line_id='';
                                var company = '';
                                var company2 = '';
                                var address = '';
                                var cardname = '';
                                var bwidth = 0;
                                var bheight = 0;
                                var keyname = [];
                                var asize = [];
                                var wordsize = 0;
                                for(var i = 0; i < regions.length;i++){
                                    var lines = regions[i].lines;
                                    for(var j =0; j < lines.length;j++){
                                        var words = lines[j].words;
                                        var boundingBox = lines[j].boundingBox;
                                        boundingBox = JSON.parse('['+boundingBox+']');
                                        bwidth = boundingBox[2];
                                        bheight = boundingBox[3];
                                        for(var k=0; k<words.length;k++){
                                            var text = words[k].text;
                                            console.log(k);
                                            if(text=="一"){
                                                if(k == 0){
                                                    //continue;
                                                } else {
                                                    if(!isNaN(Number(words[k-1].text)) || (words[k-1].text).indexOf('-') != -1){
                                                        text = text.replace('一', '-');
                                                    }
                                                }
                                            } /*else if(text.indexOf('@') != -1){
                                                if(text.slice(0,1) != '@' && text.indexOf('.') != -1){ //排除LINE ID前面的@
                                                    email = text;
                                                }
                                        }*/ /*else if((text.toLowerCase()).indexOf('line') != -1){
                                                for(var lid=0; lid<words.length;lid++){
                                                    line_id = line_id+words[lid].text;
                                                }
                                            }//this
                                            line_text = line_text+text;
                                        }
                                        var patterntel = new RegExp(/^0(2|3|37|4|49|5|6|7|8|82|89|826|836)\d+(ext|Ext|EXT|ext.|Ext.|EXT.|\#|\-|分機|分机|分|轉|转)\d+/); //
                                        var patterntelc = new RegExp(/^0(2|3|37|4|49|5|6|7|8|82|89|826|836)\d{7,8},\d{3,4}$/);
                                        line_text = line_text.replace('-','').replace('-','').replace('-','').replace('-','').replace('(','').replace(')','').replace('+','').replace("·","").replace("·","").replace("·","");
                                        if((line_text.indexOf('@') != -1)){ //email
                                            if(line_text.slice(0,1) != '@' && line_text.indexOf('.') != -1){ //排除LINE ID前面的@
                                                var check_email = line_text.toLowerCase();
                                                check_email = check_email.replace("email", "").replace(":", "").replace("e-", "").replace("mail", "").replace("/tw", ".tw");
                                                email = check_email;
                                            }
                                        }
                                        //公司
                                        if(line_text.indexOf("司")!= -1 && line_text.indexOf("有限")!= -1){ //暫時把公司改成司，因為有時候會辨識司一個字
                                            console.log('------------company');
                                            console.log(line_text);
                                            //var check_company0 = line_text.split("公司")[0];
                                            //var check_company1 = line_text.split("公司")[1];
                                            //check_company0 = check_company0+'公司';
                                            //console.log('******'+check_company1);
                                            //line_text = line_text+check_company1; //公司後面的字串丟回line_text
                                            //console.log('&&&&&&'+line_text);
                                            //words.push(check_company1);
                                            //company = check_company0;
                                            company = line_text;
                                        } else if(line_text.indexOf("院")!= -1 || line_text.indexOf("銀行")!= -1 || line_text.indexOf("银行")!= -1 || line_text.indexOf("國際")!= -1 || line_text.indexOf("国际")!= -1 || line_text.indexOf("科技")!= -1 || line_text.indexOf("矽谷")!= -1 || line_text.indexOf("集團")!= -1 || line_text.indexOf("集团")!= -1 || line_text.indexOf("大學")!= -1 || line_text.indexOf("大学")!= -1 || line_text.indexOf("聯盟")!= -1 || line_text.indexOf("联盟")!= -1 || line_text.indexOf("人壽")!= -1 || line_text.indexOf("人寿")!= -1 || (line_text.toLowerCase()).indexOf("inc.")!= -1 || (line_text.toLowerCase()).indexOf("co.")!= -1 || (line_text.toLowerCase()).indexOf("technology")!= -1){
                                            company2 = line_text;
                                        }
                                        //地址
                                        if (line_text.indexOf("路")!= -1 || line_text.indexOf("市")!= -1 || line_text.indexOf("室")!= -1 || line_text.indexOf("樓")!= -1 || line_text.indexOf("楼")!= -1){
                                            address = line_text;
                                        }
                                        /*if(line_text.length == 3){
                                            console.log('333333333'+line_text.indexOf("業務"));
                                            if(line_text.indexOf("業務") !=-1 || line_text.indexOf("經理") != -1 || line_text.indexOf("專員") != -1 || line_text.indexOf("協理") != -1 || line_text.indexOf("教授") != -1 || line_text.indexOf("院長") != -1 || line_text.indexOf("技術") != -1 || line_text.indexOf("行銷") != -1 || line_text.indexOf("主任") != -1 || line_text.indexOf("執行") != -1 || line_text.indexOf("顧問") != -1 || line_text.indexOf("大中華") != -1 || line_text.indexOf("研究") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("銷售") != -1 || line_text.indexOf("销售") != -1 || line_text.indexOf("統編") != -1 || line_text.indexOf("亞洲") != -1 || line_text.indexOf("工程") != -1 || line_text.indexOf("規劃") != -1 || line_text.indexOf("課長") != -1 || line_text.indexOf("創辦") != -1 || line_text.indexOf("辦公") != -1 || line_text.indexOf("市場") != -1 || line_text.indexOf("台灣") != -1 || line_text.indexOf("事業") != -1 || (line_text.toLowerCase()).indexOf("ceo") != -1 || line_text.indexOf("副理") != -1 || line_text.indexOf("處長") != -1 || line_text.indexOf("副總") != -1 || line_text.indexOf("博士") != -1 || line_text.indexOf("桌") != -1){
                                                continue;
                                            }else{
                                                cardname = line_text;
                                            }
                                        }else if(line_text.length ==2 || line_text.length == 4){
                                            if(line_text.indexOf("業務") != -1 || line_text.indexOf("經理") != -1 || line_text.indexOf("專員") != -1 || line_text.indexOf("協理") != -1 || line_text.indexOf("教授") != -1|| line_text.indexOf("院長") != -1|| line_text.indexOf("技術") != -1 || line_text.indexOf("行銷") != -1 || line_text.indexOf("主任") != -1 || line_text.indexOf("執行") != -1 || line_text.indexOf("顧問") != -1 || line_text.indexOf("大中華") != -1 || line_text.indexOf("研究") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("銷售") != -1 || line_text.indexOf("销售") != -1 || line_text.indexOf("統編") != -1 || line_text.indexOf("亞洲") != -1 || line_text.indexOf("工程") != -1 || line_text.indexOf("規劃") != -1 || line_text.indexOf("課長") != -1 || line_text.indexOf("創辦") != -1 || line_text.indexOf("辦公") != -1 || line_text.indexOf("市場") != -1 || line_text.indexOf("台灣") != -1 || line_text.indexOf("事業") != -1 || line_text.indexOf("副理") != -1 || line_text.indexOf("處長") != -1 || line_text.indexOf("副總") != -1 || line_text.indexOf("博士") != -1 || line_text.indexOf("桌") != -1){
                                                continue;
                                            }else{
                                                cardname = line_text;
                                            }
                                        }//this
                                        wordsize = bwidth*bheight;
                                        var checkEnglish = /^[\d|A-Z]+$/;
                                        if(line_text.length>=2 && line_text.length<=7){
                                            //if(line_text.indexOf("業務") !=-1 || line_text.indexOf("經理") != -1 || line_text.indexOf("專員") != -1 || line_text.indexOf("協理") != -1 || line_text.indexOf("教授") != -1 || line_text.indexOf("院長") != -1 || line_text.indexOf("技術") != -1 || line_text.indexOf("行銷") != -1 || line_text.indexOf("主任") != -1 || line_text.indexOf("執行") != -1 || line_text.indexOf("顧問") != -1 || line_text.indexOf("大中華") != -1 || line_text.indexOf("研究") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("銷售") != -1 || line_text.indexOf("销售") != -1 || line_text.indexOf("統編") != -1 || line_text.indexOf("亞洲") != -1 || line_text.indexOf("工程") != -1 || line_text.indexOf("規劃") != -1 || line_text.indexOf("課長") != -1 || line_text.indexOf("創辦") != -1 || line_text.indexOf("辦公") != -1 || line_text.indexOf("市場") != -1 || line_text.indexOf("台灣") != -1 || line_text.indexOf("事業") != -1 || (line_text.toLowerCase()).indexOf("ceo") != -1 || line_text.indexOf("副理") != -1 || line_text.indexOf("處長") != -1 || line_text.indexOf("副總") != -1 || line_text.indexOf("博士") != -1 || line_text.indexOf("桌") != -1){
                                            if(line_text.slice(0,2)=="業務" || line_text.slice(0,3)=="總經理" || line_text.slice(0,2)=="經理" || line_text.indexOf("專員") != -1 || line_text.indexOf("協理") != -1 || line_text.indexOf("教授") != -1 || line_text.indexOf("院長") != -1 || line_text.slice(0,2)=="技術" || line_text.slice(1,3)=="術長"|| line_text.indexOf("行銷") != -1 || line_text.indexOf("主任") != -1 || line_text.indexOf("執行") != -1 || line_text.indexOf("顧問") != -1 || line_text.indexOf("大中華") != -1 || line_text.indexOf("研究") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("业务") != -1 || line_text.indexOf("銷售") != -1 || line_text.indexOf("销售") != -1 || line_text.indexOf("統編") != -1 || line_text.indexOf("亞洲") != -1 || line_text.indexOf("工程") != -1 || line_text.indexOf("規劃") != -1 || line_text.indexOf("課長") != -1 || line_text.indexOf("創辦") != -1 || line_text.indexOf("辦公") != -1 || line_text.indexOf("市場") != -1 || line_text.indexOf("台灣") != -1 || line_text.indexOf("事業") != -1 || (line_text.toLowerCase()).indexOf("ceo") != -1 || line_text.indexOf("副理") != -1 || line_text.indexOf("處長") != -1 || line_text.indexOf("副總") != -1 || line_text.indexOf("博士") != -1 || line_text.indexOf("有限") != -1 || line_text.indexOf("物聯") != -1 || line_text.indexOf("公司") != -1 || line_text.indexOf("科技") != -1 || line_text.indexOf("集團") != -1 || line_text.indexOf("電子") != -1 || line_text.indexOf("客服") != -1 || line_text.indexOf("編號") != -1 || line_text.indexOf("電話") != -1 || line_text.indexOf("電絡") != -1 || line_text.indexOf("機") != -1 || line_text.indexOf("桌") != -1){
                                                //continue;
                                            } else if(checkEnglish.test(line_text)){
                                                //
                                            }else {
                                                //keyname.push({"size":wordsize, "name":line_text});
                                                asize.push(wordsize);
                                                keyname.push(line_text);
                                            }
                                        }
                                        if(((line_text.toLowerCase()).indexOf("mobile") != -1 || line_text.indexOf("手機") != -1 || line_text.indexOf("手机") != -1 || line_text.indexOf("行動電話") != -1 || line_text.indexOf("行动电话") != -1 || line_text.indexOf("行動") != -1 || line_text.indexOf("行动") != -1) && line_text.indexOf("8869") != -1 || line_text.indexOf("09") != -1){
                                            var check_mobilephone = line_text;
                                            check_mobilephone = (check_mobilephone.toLowerCase()).replace("mobile", "");
                                            check_mobilephone = check_mobilephone.replace("手機", "").replace("手机", "").replace("行動電話", "").replace("行动电话", "").replace("行動", "").replace("行动", "");
                                            check_mobilephone = check_mobilephone.replace(":", "");
                                            mobilephone = check_mobilephone;
                                            for_check_number = "";
                                        }else if(line_text.length>=10 && line_text.indexOf('09') != -1){ //判斷長度大於10且包含09的string
                                            var check_mobile = line_text.split("09")[1]; //把09之後的string切出來
                                            if(!isNaN(Number(check_mobile.slice(0,1)))){ //判斷切出來的string後面一位是否是數字
                                                if(check_mobile.length >=7 &&check_mobile.length <= 8 ){ //判斷長度是否介於7到8之間
                                                    check_mobile = '09'+check_mobile; //補上前面09
                                                    mobilephone = check_mobile;
                                                }
                                            }
                                            for_check_number = "";
                                        } else if((line_text.toLowerCase()).indexOf("telphone") != -1 || (line_text.toLowerCase()).indexOf("tel") != -1 || line_text.indexOf("市話") != -1 || line_text.indexOf("专线") != -1 || (line_text.indexOf("電話") != -1 && line_text.indexOf("行動") == -1) || (line_text.indexOf("电话") != -1 && line_text.indexOf("行动") == -1)){
                                            console.log('tel')
                                            var check_tel = line_text.toLowerCase();
                                            var splitfax = "";
                                            if(check_tel.indexOf("fax") != -1){ //當tel和fax同一行
                                                splitfax = check_tel.split("fax")[1];
                                                check_tel = check_tel.split("fax")[0];
                                                fax = splitfax;
                                                fax = fax.replace(":", "");
                                            }
                                            check_tel = check_tel.replace("telphone", "");
                                            check_tel = check_tel.replace("tel", "");
                                            check_tel = check_tel.replace("電話", "");
                                            check_tel = check_tel.replace("电话", "");
                                            check_tel = check_tel.replace("市話", "");
                                            check_tel = check_tel.replace(":", "");
                                            check_tel = check_tel.replace("+", "").replace("(", "").replace(")", "");
                                            check_tel = check_tel.replace("/", "");
                                            var second_check_tel = check_tel.slice(0,1);
                                            if(!isNaN(Number(second_check_tel)) || second_check_tel == "(" || second_check_tel == "+"){
                                                tel = check_tel;
                                            } 
                                        } else if(line_text.indexOf('886') != -1){
                                            var check_phone_number = line_text.split("886")[1]; //把886之後的string切出來
                                            console.log('381'+check_phone_number);
                                            if(check_phone_number.slice(0,1) == "9" || check_phone_number.slice(1,2) == "9"){ //判斷切出來的string後面一位是否是數字
                                                if(check_phone_number.length<=9){
                                                    check_phone_number = "886"+check_phone_number;
                                                    mobilephone = check_phone_number;
                                                }
                                            } else {
                                                if(!isNaN(Number(check_phone_number.slice(0,1))) || check_phone_number.slice(0,1) == "·"){
                                                    check_phone_number=check_phone_number.toLowerCase();
                                                    if(check_phone_number.indexOf('fax')){
                                                        var split_fax = check_phone_number.split("fax")[1];
                                                        var tel_number = check_phone_number.split("fax")[0];
                                                        split_fax = split_fax.replace(":","");
                                                        fax = split_fax;
                                                        tel_number = tel_number.replace(":","");
                                                        tel = '886'+tel_number;
                                                    } else {
                                                        check_phone_number = "886"+check_phone_number;
                                                        tel = check_phone_number;
                                                    }
                                                }
                                            }
                                        } else if((line_text.toLowerCase()).indexOf("fax") != -1 || line_text.indexOf("傳真") != -1 || line_text.indexOf("传真") != -1){
                                            console.log('fax');
                                            var check_fax = line_text;
                                            check_fax = (check_fax.toLowerCase()).replace("fax", "");
                                            check_fax = check_fax.replace("传真", "");
                                            check_fax = check_fax.replace("傳真", "");
                                            check_fax = check_fax.replace(":", "");
                                            fax = check_fax;
                                        } else if(line_text.match(patterntel)){
                                            console.log('match');
                                            console.log('%%%%%'+line_text);
                                            tel = line_text;
                                        }
                                        all_text = all_text+line_text+'\n';
                                        line_text = '';
                                    }
                                } //end for loop
                                console.log(JSON.stringify(keyname));
                                if(keyname.length == 1){
                                    cardname = keyname[0];
                                } else{
                                    var max = -Infinity, min = +Infinity;
                                    for (var i = 0; i < asize.length; i++) {
                                        if (asize[i] > max) {
                                          max = asize[i];
                                          console.log(asize[i]);
                                          cardname = keyname[i];
                                        }
                                        if (asize[i] < min) {
                                          min = asize[i];
                                          console.log(asize[i]);
                                          console.log(keyname[i]);
                                        }
                                      }
                                }
                                if(all_text == ''){
                                    SendMessage(acct, '對不起我太傻了，這張照片我看不太懂，請再試一次，謝謝', 'tstiisacompanyfortatung', reply_token, function (ret) {
                                    });
                                } else {
                                    SendMessage(acct, all_text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                        if(email != ''){
                                            SendMessage(acct, '信箱  '+email, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(address != ''){
                                            SendMessage(acct, '地址:  '+address, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(company != ''){
                                            SendMessage(acct, '公司1:  '+company, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(company2 != ''){
                                            if(company == ''){
                                                company = company2;
                                                SendMessage(acct, '公司:  '+company, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                                });
                                            } else {
                                                SendMessage(acct, '公司2:  '+company2, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                                });
                                            }
                                        }
                                        if(mobilephone != ''){
                                            SendMessage(acct, '這是手機'+mobilephone, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(tel != ''){
                                            SendMessage(acct, '這是市話'+tel, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(fax != ''){
                                            SendMessage(acct, '這是傳真'+fax, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(cardname != ''){
                                            SendMessage(acct, '這是人名  '+cardname, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                        if(line_id != ''){
                                            SendMessage(acct, 'LINE_ID:  '+line_id, 'tstiisacompanyfortatung', reply_token, function (ret) {
                                            });
                                        }
                                    });
                                }*/
                                SendMessage(acct, "給誰?", 'tstiisacompanyfortatung', reply_token, function (ret) {
                                });
                            });

                        });
                    });

                });
                /*SendMessage(acct, image_id, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });*/
            }
        } else if (results[idx].type == 'accountLink') {
            /*SendMessage(acct, results[idx].message.text, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });*/
            if (results[idx].link.result == 'ok') {
                SendMessage(acct, '大同寶寶：加入LINE個人服務成功!', 'tstiisacompanyfortatung', reply_token, function (ret) {
                    SendSticker(acct, '2', '516', 'tstiisacompanyfortatung', reply_token, function (ret) {
                    });
                });
                LinkrichmenuUsers(acct, 'tstiisacompanyfortatung');
                /*SendSticker(acct, results[idx].message.packageId, results[idx].message.stickerId, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });*/

            } else if (results[idx].link.result == 'failed') {
                SendMessage(acct, '加入LINE個人服務作業失敗', 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
            }

        }
    }
});

app.get('/pnp', function (request, response) {
    console.log('GET /mylifftest');
    request.header("Content-Type", 'text/html');
    var fs = require('fs');
    fs.readFile(__dirname + '/pnp.html', 'utf8', function (err, data) {
        if (err) {
            this.res.send(err);
        }
        //data = data+'<script type="text/javascript"> var textpnp =  ' + textpnp + ' ;</script>';
        this.res.send(data);
    }.bind({ req: request, res: response }));
});

app.post('/pnp/send/:phonenumber/:messages', function (request, response) {
    var phonenumber = request.params.phonenumber;
    var messages = request.params.messages;
    var password = request.body.password;
    password = password + 'fortatung';
    var hashnumber = sha256(phonenumber);
    if (password == 'tstiisacompanyfortatung') {
        console.log("-----------------------------" + messages);
        var data = {
            "to": hashnumber,
            "messages": [
                {
                    "type": "text",
                    "text": messages
                }
            ]
        } //end data
        if (messages === "flex") {
            data.messages = [
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
                                    "text": "today",
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
        }
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/bot/pnp/push/verified',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Content-Length': Buffer.byteLength(JSON.stringify(data)),
                'Authorization': 'Bearer <' + config.beacon_channel_access_token + '>'
            }
        } //end options
        var https = require('https');
        var req = https.request(options, function (res) {
            console.log('statusCode:', res.statusCode);
            if (res.statusCode == 200) {
                response.send("success");
            } else {
                response.send("fail" + res.statusCode);
            }
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
    } else {
        response.send("密碼錯誤");
    }
});

app.get('/liff', function (request, response) {
    console.log('GET /liff');
    request.header("Content-Type", 'text/html');
    var fs = require('fs');
    fs.readFile(__dirname + '/liffurl.html', 'utf8', function (err, data) {
        if (err) {
            this.res.send(err);
        }
        //data = data+'<script type="text/javascript"> var textpnp =  ' + textpnp + ' ;</script>';
        this.res.send(data);
    }.bind({ req: request, res: response }));
});

app.get('/images/Starsinthesky.jpg', function (request, response) {
    console.log('GET /images/Starsinthesky.jpg');
    request.header("Content-Type", 'image/jpeg');
    var fs = require('fs');
    fs.readFile(__dirname + '/images/Starsinthesky.jpg', function (err, data) {
        if (err) {
            this.res.send(err);
        }
        this.res.send(data);
    }.bind({ req: request, res: response }));
});

app.get('/liffprofile', function (request, response) {
    console.log('GET /liff');
    request.header("Content-Type", 'text/html');
    var fs = require('fs');
    fs.readFile(__dirname + '/liffprofile.html', 'utf8', function (err, data) {
        if (err) {
            this.res.send(err);
        }
        //data = data+'<script type="text/javascript"> var textpnp =  ' + textpnp + ' ;</script>';
        this.res.send(data);
    }.bind({ req: request, res: response }));
});
app.post('/api/liff/add', function (request, response) {
    var urltoliff = request.body.urltoliff;
    var lifftype = request.body.lifftype;
    var password = request.body.password;
    password = password + 'fortatung';
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            "view": {
                "type": lifftype,
                "url": urltoliff
            }
        } //end data
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/liff/v1/apps',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Content-Length': Buffer.byteLength(JSON.stringify(data)),
                'Authorization': 'Bearer <' + config.channel_access_token + '>'
            }
        } //end options
        var https = require('https');
        var req = https.request(options, function (res) {
            console.log('statusCode:', res.statusCode);
            if (res.statusCode == 200) {
                res.setEncoding('utf8');
                var data_chunk = '';
                res.on('data', function (chunk) {
                    data_chunk += chunk;
                });
                res.on('end', function () {
                    var data = JSON.parse(data_chunk);
                    response.send(data);
                });

            } else {
                //response.send("fail" + res.statusCode);
                logger.info(res.statusCode);
                response.send('notsuccess');
            }
        });
        req.write(JSON.stringify(data));
        req.end();
        try {
            callback(true);
        } catch (e) { };
    } else {
        response.send("密碼錯誤");
    }
});


app.post('/postmember', function (request, response) {
    console.log('post /postmember');
    var email = request.body.email;
    var password = request.body.password;
    if (email == 'andy@hotmail.com' && password == '1234567890') {
        useremail = 1;
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
    } else if (email == 'peter@gmail.com' && password == '1234567890') {
        useremail = 0;
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
    } else {
        response.send('wrong');
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

function SendGiftMessage(user, password) {
    //console.log(JSON.stringify(user));
    var userId = JSON.stringify(user.userId);
    var pic = JSON.stringify(user.pictureUrl);
    var name = JSON.stringify(user.displayName);
    userId = userId.replace('\"\\"', '').replace('\\"\"', '');
    pic = pic.replace('\"\\"', '').replace('\\"\"', '');
    name = "恭喜" + name.replace('\"\\"', '').replace('\\"\"', '');
    //console.log(userId);
    //console.log(pic);
    //console.log(name);
    if (password == 'tstiisacompanyfortatung') {
        var num = Math.floor((Math.random() * 6));
        var data = gift.build_Gift(userId, pic, name, num);
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
            console.log('statusCode:', res.statusCode);
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
}

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
                console.log('--------------------------------------------------------------------------------' + linkToken);
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
                "altText": "加入LINE個人服務",
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
                            "uri": "https://tatungflextest01.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                        }
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "md",
                        "action": {
                            "type": "uri",
                            "uri": "https://tatungflextest01.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                        },
                        "contents": [
                            {
                                "type": "text",
                                "text": "加入LINE個人服務",
                                "size": "xl",
                                "weight": "bold",
                                "action": {
                                    "type": "uri",
                                    "uri": "https://tatungflextest01.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
                                },
                            },
                            {
                                "type": "text",
                                "text": "請點選下方按鈕加入LINE個人服務",
                                "wrap": true,
                                "color": "#aaaaaa",
                                "size": "md",
                                "action": {
                                    "type": "uri",
                                    "uri": "https://tatungflextest01.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
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
                                "color": "#e60412",
                                "action": {
                                    "type": "uri",
                                    "label": "點我加入LINE個人服務",
                                    "uri": "https://tatungflextest01.herokuapp.com/tatunglogin?linkToken=" + linkToken.linkToken
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
        switch (useremail) {
            case 1:
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
                break;

            default:
                logger.info('LinkrichmenuUsers, userId: ' + userId);
                var options = {
                    host: 'api.line.me',
                    port: '443',
                    path: '/v2/bot/user/' + userId + '/richmenu/' + config.vip_rich_menu_id,
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
                break;
        }

        req.end('end');
    }
};
function UnlinkrichmenuUsers(userId, password, reply_token) {
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
                SendMessage(userId, '大同寶寶：解除LINE個人服務成功，大同寶寶謝謝您的使用', 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
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

function SendflexMessage(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                {
                    "type": "flex",
                    "altText": "e同購特價商品",
                    "contents": carous
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
function GetUserRichMenuId(userId, message, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        logger.info('傳送訊息給 ' + userId);
        var options = {
            host: 'api.line.me',
            port: '443',
            path: '/v2/bot/user/' + userId + '/richmenu',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer <' + config.channel_access_token + '>'
            }
        }
        console.log('##########################################' + options.path);
        var https = require('https');
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            var response_data = '';
            res.on('data', function (chunk) {
                logger.info('*************************************Response: ' + chunk);
                response_data += chunk;
            });
            res.on('end', function () {
                var richmenu = JSON.parse(response_data);
                var message = richmenu.message;
                //SendLinkingUrl(userId, linkToken, 'tstiisacompanyfortatung');
                SendQuickReplies(userId, message, 'tstiisacompanyfortatung', reply_token, function (ret) {
                });
            });
        }).end();
    } else {
        callback(false);
    }
};

function SendQuickReplies(userId, richmenumessage, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        console.log('SendQuickReplies');
        if (richmenumessage == 'the user has no richmenu') {
            var data = {
                'to': userId,
                'messages': [
                    {
                        "type": "text", // ①
                        "text": "嗨!我在這，有什麼大同寶寶可以為您服務的嗎?",
                        "quickReply": quickreply
                    }
                ]
            }; //end data
        } else {
            var data = {
                'to': userId,
                'messages': [
                    {
                        "type": "text", // ①
                        "text": "嗨!我在這，有什麼大同寶寶可以為您服務的嗎?",
                        "quickReply": linequickreply
                    }
                ]
            }; //end data
        }
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
};

// 傳送貼圖給 LINE 使用者
function SendSticker(userId, package, sticker, password, reply_token, callback) {
    console.log('SendSticker-----------------------------------------------------' + package + ' ' + sticker);
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                { 'type': 'sticker', 'packageId': package, 'stickerId': sticker }
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
// 傳送URI給 LINE 使用者
function SendURI(userId, label, uri, password, reply_token, callback) {
    if (password == 'tstiisacompanyfortatung') {
        var data = {
            'to': userId,
            'messages': [
                {
                    'type': 'template',
                    'altText': label,
                    'template': {
                        'type': 'buttons',
                        'text': label,
                        'actions': [{
                            "type": 'uri',
                            'label': label,
                            'uri': uri
                        }]
                    }
                }
            ]
        }; //end data
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
};

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