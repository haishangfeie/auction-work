import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { Product, ProductService, Comment } from '../shared/product.service';
import {WebSocketService} from "../shared/web-socket.service";
import {Subscription} from "rxjs/Subscription";
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})

export class ProductDetailComponent implements OnInit {
  product: Product;
  comments: Comment[];
  newRating = 5;
  newComment= '';
  isCommentHidden = true;
  isWatched = false;
  currentBid: number;
  subscription: Subscription;
  constructor(private routeInfo: ActivatedRoute,
              private productService: ProductService,
              private  wsService: WebSocketService
  ) { }

  ngOnInit() {
    const productId: number = this.routeInfo.snapshot.params["productId"];
    this.productService.getProduct(productId).subscribe(
      product => {
        this.product = product;
        this.currentBid = product.price;
      }
    );
    this.productService.getCommentsForProductId(productId)
      .subscribe(comment => { this.comments = comment; } );

  }
  addComment() {
    const comment = new Comment(0, this.product.id, new Date().toISOString(), "someone", this.newRating, this.newComment);
    this.comments.unshift(comment);

    const rating = this.comments.reduce(( sum , commentTmp ) => sum + commentTmp.rating, 0);
    this.product.rating = rating / this.comments.length;
    this.newComment = null;
    this.newRating = 5;
    this.isCommentHidden = true;
  }

  watchProduct() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.isWatched = false;
      this.subscription = null;
    }else {
      this.isWatched = true;
      this.subscription = this.wsService.createObservableSocket("ws://localhost:8085", this.product.id)
        .subscribe(
          products => {
            const product = products.find(p => p.productId === this.product.id);
            this.currentBid = product.bid;
          }
        );
    }

  }

}
