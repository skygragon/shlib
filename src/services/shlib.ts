import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import * as _ from 'underscore';
import * as cheerio from 'cheerio';

import { Book, Record } from '../models/book';
import { ImageService } from '../services/image';

const BOOKS_SEARCH_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?index=.TW&term={term}&page={page}';
//const BOOK_SEARCH_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?uri={uri}';
//const BOOK_ISBN_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?index=ISBN&term={isbn}';
const BOOK_WX_URL = 'http://reg.library.sh.cn/SHLIBWX/servlet/ShlibServlet?bookid={id}&apid=ShlibBookDetailServiceImpl';
const BOOK_SORT = '&sort=3100023';

@Injectable()
export class SHLibService {
  constructor(private http: Http, private image: ImageService) {}

  searchBooks(term, page) {
    let url = BOOKS_SEARCH_URL.replace('{term}', encodeURIComponent(term))
                              .replace('{page}', page + 1)
                              + BOOK_SORT;

    console.log(`get url: ${url}`);
    return this.http.get(url)
      .toPromise()
      .then(res => this.parseByGuess(cheerio.load(res.text()), new Book()))
      .catch(err => { console.log(`Failed to get ${url}: ${err}`); return null; });
  };

	getBookById = function(book: Book) {
		var url = BOOK_WX_URL.replace('{id}', book.id);
    console.log(`get url: ${url}`);
		book.isCK = book.isPT = book.isDone = false;

		return this.http.get(url)
      .toPromise()
      .then(res => this.parseWXBook(cheerio.load(res.text()), book))
      .then(book => this.image.setImage(book))
      .catch(err => { console.log(`Failed to get ${url}: ${err}`); return book; });
  }

  parseByGuess($, book: Book) {
		let id = this.parseBookId($);
		if (id) {
			// found only 1 result, cont'd to get details
			book.id = id;
			return this.getBookById(book).then(book => [book]);
		} else {
			// found multiple results, delay getting details
			return this.parseBooks($);
		}
	}

	parseBookId($) {
		try {
			return $.getElementsByName('QRCode')[0]
								.attributes['src'].value
								.split('bib=').pop();
		} catch(e) { return null; }
	}

	parseBooks($) {
    let n = Number($('.normalBlackFont2 b').first().text());
    console.log(n);

		let forms = $('form[name=summary]');
		if (forms.length == 0) return [];

    return _.map(forms.children('td').children('table'),
      table => {
				let book = new Book();

				let name = $(table).find('.mediumBoldAnchor');
        name.find('a').remove();
			  book.name = name.text().trim();
				book.idxAll = n;

				let href = name.attr('href').match(/&uri=([^&]+)/);
				if (href) {
					book.uri = href[1];
					let parts = href[1].split('@!');
					book.idx = Number(parts.pop()) + 1;
					book.id = parts.pop();
				}

        let attrs = _.map($(table).find('.normalBlackFont1'), x => $(x).text().trim());
				for (let j = 0; j < attrs.length; ++j) {
					if (attrs[j].indexOf('著者') >= 0) {
						book.rawAuthor = attrs[j];
						book.rawPublish = attrs[j + 1];
						break;
					}
        }

				console.log(JSON.stringify(book));
				return book;
			});
	}

  parseWXBook($, book: Book) {
    book.name = book.name || $('h3').text().trim();
    book.img = $('.thumbnail img').attr('src');
    book.info = $('.text-info').first().next().text().trim();

    _.each($('p'), item => {
      var parts = $(item).text().trim().split(':');
      if (parts.length !== 2) return;

      switch (parts[0]) {
        case '作者':     book.author = parts[1];      break;
        case 'ISBN':     book.isbn = parts[1];        break;
        case '出版社':   book.publishBy = parts[1];   break;
        case '出版时间': book.publishDate = parts[1]; break;
      }
    });

    book.records = _.map($('.table-responsive tbody tr'), tr => {
      var tds = $(tr).children('td');

      var record = new Record();
      record.owner  = tds.eq(0).text().trim();
      record.type   = tds.eq(1).text().trim();
      record.state  = tds.eq(2).text().trim();
      record.depart = tds.eq(3).text().trim();
      record.id     = tds.eq(4).text().trim();

      if (record.state === '归还') {
        record.color = 'primary';
        if (record.type === '参考外借资料') book.isCK = true;
        if (record.type === '普通外借资料') book.isPT = true;
      }
      return record;
    });

    book.isDone = true;
    return book;
  }
}
