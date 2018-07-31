function build_Gift(userId, pic, name, num) {
    switch (num) {
        case 0:
            return {
                "to": userId,
                "messages": [
                    {
                        "type": "flex",
                        "altText": "e同購抽獎遊戲",
                        "contents": {
                            "type": "bubble",
                            "header": {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "特獎",
                                        "weight": "bold",
                                        "color": "#444444",
                                        "size": "xl"
                                    }
                                ]
                            },
                            "hero": {
                                "type": "image",
                                "url": "https://www.etungo.com.tw/files/TC_PSpec/PS_Pic/TAW-A150Ls.jpg",
                                "size": "full",
                                "aspectRatio": "20:13",
                                "aspectMode": "fit",
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
                                        "text": "大同15KG定頻洗衣機",
                                        "size": "xl",
                                        "weight": "bold"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "horizontal",
                                        "spacing": "md",
                                        "contents": [
                                            {
                                                "type": "image",
                                                "url": pic,
                                                "aspectMode": "cover",
                                                "aspectRatio": "4:3",
                                                "size": "sm",
                                                "gravity": "bottom"
                                            },
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": name,
                                                        "size": "sm",
                                                        "color": "#444444"
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "抽到特獎",
                                                        "size": "sm",
                                                        "color": "#444444"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "button",
                                        "style": "primary",
                                        "color": "#e60412",
                                        "action": {
                                            "type": "uri",
                                            "label": "登入e同購",
                                            "uri": "https://www.etungo.com.tw/inside/377/722/728/60127.html"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            };
            break;
    }
}