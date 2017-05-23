import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Book } from '../../models/book';
import { BookPage } from '../book/book';
import { DBService } from '../../services/db';
import { ImageService } from '../../services/image';

@Component({
  selector: 'page-books',
  templateUrl: 'books.html'
})

export class BooksPage {
  static title = '收藏';
  static icon = 'star';

  books: Book[] = [];
  pages: Array<any> = [];
  filter: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: DBService,
    public image: ImageService
  ) {
    this.pages = navParams.get('pages') || [];
    this.filter = navParams.get('filter');
    this.refresh();
  }

  refresh() {
    this.db.getBooks().then(books => {
      this.books = this.filter ? books.filter(this.filter) : books;
    });
  }

  showBook(book: Book) {
    this.navCtrl.push(BookPage, {
      book: book,
      pages: this.pages.concat(this)
    });
  }

  getImage(book: Book) {
    return this.image.getImage(book);
  }
}
