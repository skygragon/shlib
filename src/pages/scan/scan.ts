import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Book } from '../../models/book';
import { SHLibService } from '../../services/shlib';
import { UIService } from '../../services/ui';
import { BookPage } from '../book/book';

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})

export class ScanPage {
  static title = '扫描';
  static icon = 'qr-scanner';

  books: Book[] = [];

  constructor(
    public navCtrl: NavController,
    public shlib: SHLibService,
    public ui: UIService
  ) {
  }

  scan() {
    let isbn = '7560926991';
    this.shlib.searchByISBN(isbn)
      .then(books => {
        if (!books || books.length == 0) {
          return this.ui.showMessage('没有找到图书记录');
        }

        if (books.length == 1) {
          return this.showBook(books[0]);
        }

        this.books = books;
      });
  }

  showBook(book: Book) {
    this.navCtrl.push(BookPage, { book: book });
  }
}
