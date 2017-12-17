/**
 * Created by FEIE on 2017/12/11.
 */
import * as express from 'express';
import {Server} from 'ws';
import * as path from 'path';

const app=express();

app.use('/', express.static(path.join(__dirname,'..','client')) );

export class Product {
    constructor(
        public id:number,
        public title:string,
        public price:number,
        public rating:number,
        public desc:string,
        public categories:Array<string>
    ){}
}

export class Comment {
    constructor(
        public id:number,
        public productId:number,
        public timestamp:string,
        public user:string,
        public rating:number,
        public content:string
    ){}
}

const products:Product[] =[
    new Product(1,"第一个商品",1099,3.5,"这是第一个商品，是我在做面试作品时创建的",['玉器','项链']),
    new Product(2,"第二个商品",2099,4.5,"这是第二个商品，是我在做面试作品时创建的",['玉器','项链']),
    new Product(3,"第三个商品",3099,4.5,"这是第三个商品，是我在做面试作品时创建的",['玉器']),
    new Product(4,"第四个商品",4099,1.5,"这是第四个商品，是我在做面试作品时创建的",['玉器','项链']),
    new Product(5,"第五个商品",5099,4.5,"这是第五个商品，是我在做面试作品时创建的",['玉器']),
    new Product(6,"第六个商品",6099,2.5,"这是第六个商品，是我在做面试作品时创建的",['艺术品']),
];

const comments:Comment[] = [
    new Comment(1,1,"2017-02-22 22:22:22","张三",3,"东西不错"),
    new Comment(2,1,"2017-04-22 22:22:22","李四",4,"东西一般"),
    new Comment(3,2,"2017-07-12 12:22:22","王五",4,"东西挺好"),
    new Comment(4,2,"2017-04-02 22:22:22","赵六",5,"东西很好"),
];

app.get('/api/products',(req,res)=>{
    let result = products;
    let params = req.query;
    if(params.title) {
        result = result.filter((p) => p.title.indexOf(params.title) !==-1);
    }
    if(params.price && result.length>0) {
        result = result.filter((p) => p.price<= parseInt(params.price));
    }
    if(params.category && params.category!=='-1' && result.length>0) {
        result = result.filter((p) => p.categories.indexOf(params.category) !==-1);
    }
    res.json(result);

});


app.get('/api/carousel',(req,res)=>{
    res.json(["../../assets/images/carousel1.webp","../../assets/images/carousel2.webp","../../assets/images/carousel3.webp"]);
});

app.get('/api/product/:id',(req,res)=>{
    res.json(products.find((product)=>product.id==req.params.id));
});

app.get('/api/product/:id/comments',(req,res)=>{
    res.json(comments.filter((comment:Comment)=>{
        return comment.productId == req.params.id;
    }));
});

const server = app.listen(8000,"localhost",()=>{
    console.log("服务器已启动，地址是：http://localhost:8000");
})

const subscription = new Map<any, number[]>();

const wsServer = new Server({port:8085});
wsServer.on("connection",websocket=>{
    websocket.on("message", (message:string) =>{
        let messageObj = JSON.parse( message);
        let productIds = subscription.get(websocket) || [];
        subscription.set(websocket,[...productIds, messageObj.productId]);
    })
});

const currentBids = new Map<number, number>();

setInterval(()=>{
    products.forEach(p => {
        let currentBid = currentBids.get(p.id) || p.price;
        let newBid = currentBid + Math.random() *2;
        currentBids.set(p.id,newBid);
    })
    subscription.forEach(( productIds:number[], ws ) => {
        if(ws.readyState ===1){
            let newBids = productIds.map(pid=>({
                productId:pid,
                bid:currentBids.get(pid)
            }));
            ws.send(JSON.stringify(newBids));
        }else{
            subscription.delete(ws);
        }
    })
},3000);




