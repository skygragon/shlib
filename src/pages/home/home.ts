import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import * as _ from 'underscore';

import { DBService } from '../../services/db'
import { SHLibService } from '../../services/shlib';
import { UIService } from '../../services/ui';
import { BooksPage } from '../books/books';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  static title = '总览';
  static icon = 'home'; 

  all:   number = 0;
  avail: number = 0;
  ck:    number = 0;
  pt:    number = 0;

  filters = {
    all:   book => true,
    avail: book => book.isCK || book.isPT,
    ck:    book => book.isCK,
    pt:    book => book.isPT
  };

  constructor(
    public navCtrl: NavController,
    public db: DBService,
    public shlib: SHLibService,
    public ui: UIService
  ) {
    this.refresh();
  }

  refresh() {
    this.db.getBooks().then(books => {
      _.each(this.filters, (f, k) => {
        this[k] = books.filter(f).length;
        console.log(`${k} = ${this[k]}`);
      });
    });
  }

  showBooks(k: string) {
    this.navCtrl.push(BooksPage, {
      filter: this.filters[k],
      pages: [this]
    });
  }

  update() {
    let loading = this.ui.showLoading('正在更新...');
    this.db.getBooks()
      .then(books => Promise.all(_.map(books, book => {
        book.isDone = false;
        return this.shlib
            .getBookById(book)
            .then(book => this.db.addBook(book));
      })))
      .then(() => { loading.dismiss(); this.refresh(); })
      .catch(() => loading.dismiss());
  }
}
