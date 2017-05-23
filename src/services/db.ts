import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import * as _ from 'underscore';

import { Book } from '../models/book';

@Injectable()
export class DBService {
  db: any;
  bookIds: string[] = [];

  constructor() {
    this.db = new Dexie('shlib.db');
    this.db.version(1).stores({ books: 'id' });
  }

  open() {
    return this.db.open().catch(e =>
      console.log('db open failed:' + e.stack)
    );
  }

  getBooks() {
    return new Promise<Book[]>(resolve =>
      this.db.open().then(db =>
        db.books
          .toCollection()
          .toArray()
          .then(books => {
            this.bookIds = _.map(books, book => book.id);
            return resolve(books);
          }))
    );
  }

  addBook(book: Book) {
    return new Promise<any>(resolve =>
      this.db.open()
        .then(db => db.books.put(book))
        .then(id => {
          this.bookIds.push(id);
          return resolve();
        })
    );
  }

  removeBook(book: Book) {
    return new Promise<any>(resolve =>
      this.db.open()
        .then(db => db.books.delete(book.id))
        .then(() => {
          this.bookIds = _.without(this.bookIds, book.id);
          return resolve();
        })
    );
  }
}
