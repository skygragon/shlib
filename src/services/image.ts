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
    return this.tryChinaPub(book)
      .then(book => this.setImageData(book));
  }

  setImageData(book: Book) {
    if (book.imgData.length > 0) return Promise.resolve(book);
    if (book.img.length == 0) return Promise.reject(book);
    let img = book.img[0];
    console.log(`try get imgData: ${img}`);

    let options = new RequestOptions({
      responseType: ResponseContentType.ArrayBuffer
    });

    return this.http.get(img, options)
      .toPromise()
      .then(res => {
        book.imgData = base64js.fromByteArray(new Uint8Array(res.arrayBuffer()));
        console.log(`got imgData: ${book.imgData.length}`);
        return book;
      })
      .catch(() => {
        book.img.shift();
        return this.setImageData(book);
      });
  }

  getImage(book: Book) {
    if (book.imgData) return 'data:image/png;base64,' + book.imgData;
    if (book.img.length > 0) return book.img[0];
    return '';
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

        let img = $('.aimg img').attr('file');
        console.log(`got img: ${img}`);
        if (!img) return book;
        book.img.unshift(img);

        img = img.replace('/cover.jpg', '/shupi.jpg');
        console.log(`got img: ${img}`);
        book.img.unshift(img);

        return book;
      });
  }
}
