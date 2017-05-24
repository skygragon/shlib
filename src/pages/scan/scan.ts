import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

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
    public barcodeScanner: BarcodeScanner,
    public shlib: SHLibService,
    public ui: UIService
  ) {}

  scan() {
    this.books = [];
    this.barcodeScanner.scan()
      .then(data => this.searchBooks(data.text))
      .catch(() => this.ui.showMessage('条形码扫描失败'));
  }

  searchBooks(isbn: string) {
    let loading = this.ui.showLoading('正在查找图书');
    console.log(`search isbn = ${isbn}`);

    return this.shlib.searchByISBN(isbn)
      .then(books => {
        loading.dismiss();
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
