import { Injectable } from '@angular/core';
import { Http, RequestOptions, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import * as base64js from 'base64-js';
import * as cheerio from 'cheerio';

import { Book } from '../models/book';

@Injectable()
export class ImageService {
  constructor(private http: Http) {}

  setImage(book: Book) {
    return this.setImageData(book)
      .then(book => this.tryChinaPub(book))
      .then(book => this.setImageData(book))
      .catch(() => console.log(`failed to set image to book ${book.id}`))
  }

  setImageData(book: Book) {
    if (book.imgData.length > 0) return Promise.resolve(book);
    if (book.img.length == 0) return Promise.reject(book);

    let options = new RequestOptions({
      responseType: ResponseContentType.ArrayBuffer
    });

    return this.http.get(book.img, options)
      .toPromise()
      .then(res => {
        book.imgData = base64js.fromByteArray(new Uint8Array(res.arrayBuffer()));
        return book;
      });
  }

  getImage(book: Book) {
    if (book.imgData) return 'data:image/png;base64,' + book.imgData;
    return book.img;
  }

  // try to get image from China-pub
  tryChinaPub(book: Book) {
    if (book.imgData.length > 0) return Promise.resolve(book);
    if (book.isbn.length == 0) return Promise.reject(book);

    let url = 'http://m.china-pub.com/touch/touchsearch.aspx?keyword=' + book.isbn;
    console.log(`get url: ${url}`);

		return this.http.get(url)
      .toPromise()
      .then(res => {
        let $ = cheerio.load(res.text());
        book.img = $('.aimg img').attr('file').replace('/cover.jpg', '/shupi.jpg');
        return book;
      });
  }
}
