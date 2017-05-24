import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import * as _ from 'underscore';

import { Book } from '../../models/book';
import { DBService } from '../../services/db';
import { ImageService } from '../../services/image';
import { SHLibService } from '../../services/shlib';
import { UIService } from '../../services/ui';

@Component({
  selector: 'page-book',
  templateUrl: 'book.html'
})

export class BookPage {
  book: Book;
  pages: Array<any> = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: DBService,
    public image: ImageService,
    public shlib: SHLibService,
    public ui: UIService
  ) {
    this.pages = navParams.get('pages') || [];
    this.book = navParams.get('book');
    if (!this.book.isDone) {
      let loading = this.ui.showLoading();
      shlib.getBookById(this.book)
        .then(() => loading.dismiss())
        .catch(() => loading.dismiss());
    }
  }

  addBook(book: Book) {
    this.db.addBook(book).then(() => {
      console.log(`book ${book.id} added`);
      this.refresh();
    });
  }

  removeBook(book: Book) {
    this.db.removeBook(book).then(() => {
      console.log(`book ${book.id} removed`);
      this.refresh();
    });
  }

  refresh() {
    _.each(this.pages, page => page.refresh());
  }

  isStarred(book: Book) {
    return this.db.bookIds.indexOf(book.id) >= 0;
  }

  getImage(book: Book) {
    return this.image.getImage(book);
  }
}
