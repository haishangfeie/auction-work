import { Component, OnInit } from '@angular/core';
import { Product } from '../shared/product.service';
import { ProductService  } from '../shared/product.service';
import {Observable} from "rxjs/Observable";



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  private products: Observable<Product[]>;

  private imgUrl = 'http://placehold.it/320x150';



  constructor(private productService: ProductService) {

  }

  // 在组件示例化后会调用一次，以初始化数据
  ngOnInit() {
    this.products = this.productService.getProducts();
    this.productService.searchEvent.subscribe(
      params => this.products = this.productService.search(params)
    );
  }

}

