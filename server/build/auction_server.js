"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by FEIE on 2017/12/11.
 */
var express = require("express");
var ws_1 = require("ws");
var path = require("path");
var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
var Product = (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, "第一个商品", 1099, 3.5, "这是第一个商品，是我在做面试作品时创建的", ['玉器', '项链']),
    new Product(2, "第二个商品", 2099, 4.5, "这是第二个商品，是我在做面试作品时创建的", ['玉器', '项链']),
    new Product(3, "第三个商品", 3099, 4.5, "这是第三个商品，是我在做面试作品时创建的", ['玉器']),
    new Product(4, "第四个商品", 4099, 1.5, "这是第四个商品，是我在做面试作品时创建的", ['玉器', '项链']),
    new Product(5, "第五个商品", 5099, 4.5, "这是第五个商品，是我在做面试作品时创建的", ['玉器']),
    new Product(6, "第六个商品", 6099, 2.5, "这是第六个商品，是我在做面试作品时创建的", ['艺术品']),
];
var comments = [
    new Comment(1, 1, "2017-02-22 22:22:22", "张三", 3, "东西不错"),
    new Comment(2, 1, "2017-04-22 22:22:22", "李四", 4, "东西一般"),
    new Comment(3, 2, "2017-07-12 12:22:22", "王五", 4, "东西挺好"),
    new Comment(4, 2, "2017-04-02 22:22:22", "赵六", 5, "东西很好"),
];
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(params.price); });
    }
    if (params.category && params.category !== '-1' && result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; });
    }
    res.json(result);
});
app.get('/api/carousel', function (req, res) {
    res.json(["../../assets/images/carousel1.webp", "../../assets/images/carousel2.webp", "../../assets/images/carousel3.webp"]);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) {
        return comment.productId == req.params.id;
    }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("服务器已启动，地址是：http://localhost:8000");
});
var subscription = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connection", function (websocket) {
    websocket.on("message", function (message) {
        var messageObj = JSON.parse(message);
        var productIds = subscription.get(websocket) || [];
        subscription.set(websocket, productIds.concat([messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 2;
        currentBids.set(p.id, newBid);
    });
    subscription.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscription.delete(ws);
        }
    });
}, 3000);
