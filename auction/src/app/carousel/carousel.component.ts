import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs/Observable";
import { ProductService  } from '../shared/product.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  private imgUrl: Observable<string[]>;
  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.imgUrl = this.productService.getCarouselImg();
  }

}
