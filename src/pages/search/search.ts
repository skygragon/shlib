import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Book } from '../../models/book';
import { SHLibService } from '../../services/shlib';
import { UIService } from '../../services/ui';
import { BookPage } from '../book/book';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})

export class SearchPage {
  static title = '搜索';
  static icon = 'search';

  term: string;
  pageIdx: number = 0;
  hasPrev: boolean = false;
  hasNext: boolean = false;
  books: Book[];

  constructor(
    public navCtrl: NavController,
    public shlib: SHLibService,
    public ui: UIService
  ) {}

  searchBooks(step: number) {
    if (step == 0) this.pageIdx = 0;
    this.pageIdx += step;
    
    let loading = this.ui.showLoading('正在查找图书');

    this.shlib.searchByKey(this.term, this.pageIdx)
      .then(books => {
        loading.dismiss();
        if (!books) {
          return this.ui.showMessage('查询馆藏失败，请检查网络连接');
        }

        if (books.length == 0) {
          return this.ui.showMessage('未找到馆藏记录');
        }

        if (books.length == 1) {
          return this.showBook(books[0]);
        }

        this.books = books;
        let lastBook = books.length > 0 && books[books.length - 1];
        this.hasPrev = this.pageIdx > 0;
        this.hasNext = lastBook && lastBook.idx < lastBook.idxAll;
      })
      .catch(e => {
        loading.dismiss();
        this.ui.showMessage(e);
      });
	}

  showBook(book: Book) {
    this.navCtrl.push(BookPage, { book: book });
  }
}
