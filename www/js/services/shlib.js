var ShLib = {};

var BOOKS_SEARCH_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?index=.TW&term={term}&page={page}';
var BOOK_SEARCH_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?uri={uri}';
var BOOK_ISBN_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?index=ISBN&term={isbn}';
var BOOK_WX_URL = 'http://reg.library.sh.cn/SHLIBWX/servlet/ShlibServlet?bookid={id}&apid=ShlibBookDetailServiceImpl';

var BOOK_SORT = '&sort=3100023';

function parseBooks(resp) {
  var doc = new DOMParser().parseFromString(resp.data, 'text/html');

  var n = Number(doc.getElementsByClassName('normalBlackFont2')[0]
                    .getElementsByTagName('b')[0]
                    .innerText.trim());

  var forms = doc.getElementsByName('summary');
  if (forms.length == 0) return [];

  var books = _.chain(forms[0].nextSibling.nextSibling.childNodes)
    .filter(function(x) { return x.nodeName == 'TABLE'; })
    .map(function(table) {
      var x = table.getElementsByClassName('mediumBoldAnchor')[0];
      var book= {
        name: x.innerText.trim(),
        idxAll: n,
        isCK: false,  // 可参考外借
        isPT: false,  // 可普通外借
        isDone: false // 已更新全部信息
      };

      var m = x.attributes['href'].value.match(/&uri=([^&]+)/);
      if (m) {
        book.uri = m[1];
        var parts = m[1].split('@!');
        book.idx = Number(parts.pop()) + 1;
        book.id = parts.pop();
      }

      var attrs = _.map(table.getElementsByClassName('normalBlackFont1'), function(x) {
        return x.innerText.trim();
      });

      for (var j = 0; j < attrs.length; ++j) {
        if (attrs[j].indexOf('著者') >= 0) {
          book.rawAuthor = attrs[j];
          book.rawPublish = attrs[j + 1];
          break;
        }
      }

      // console.log(JSON.stringify(book));
      return book;
    })
    .value();

  return books;
}

function parseBookId(resp) {
  var doc = new DOMParser().parseFromString(resp.data, 'text/html');

  try {
    return doc.getElementsByName('QRCode')[0]
              .attributes['src'].value
              .split('bib=').pop();
  } catch(e) {
    return null;
  }
}

function parseByGuess(resp, book) {
  var id = parseBookId(resp);
  if (id) {
    // found only 1 result, cont'd to get details
    book = book || {};
    book.id = id;

    return ShLib.getBookById(book)
      .then(function(book) {
        return [book];
      })
  } else {
    // found multiple results, delay getting details
    return parseBooks(resp);
  }
}

ShLib.searchBooks = function(term, page) {
  var url = BOOKS_SEARCH_URL.replace('{term}', encodeURIComponent(term))
                            .replace('{page}', page + 1)
                            + BOOK_SORT;

  console.log('get url: ' + url);
  return this.$http.get(url)
    .then(function(resp) {
      return parseByGuess(resp, null);
    })
    .catch(function(resp) {
      console.log('Failed to get ' + url + ', status=' + resp.status);
      return null;
    });
};

ShLib.getBook = function(book) {
  var url = null;
  if (book.uri) url = BOOK_SEARCH_URL.replace('{uri}', book.uri);
  if (book.isbn) url = BOOK_ISBN_URL.replace('{isbn}', book.isbn);
  if (!url) return this.$q.resolve(null);

  console.log('get url: ' + url);
  return this.$http.get(url)
    .then(function(resp) {
      return parseByGuess(resp, book);
    })
    .catch(function(resp) {
      console.log('Failed to get ' + url + ', status=' + resp.status);
      return null;
    });
};

ShLib.getBookById = function(book) {
  var url = BOOK_WX_URL.replace('{id}', book.id);
  console.log('get url: ' + url);
  book.isCK = book.isPT = book.isDone = false;

  return ShLib.$http.get(url)
    .then(function(resp) {
      var doc = new DOMParser().parseFromString(resp.data, 'text/html');

      if (!book.name)
        book.name = doc.getElementsByTagName('h3')[0].innerText.trim();

      book.img = doc.getElementsByClassName('thumbnail')[0]
                    .getElementsByTagName('img')[0]
                    .attributes['src'].value;

      var items = doc.getElementsByTagName('p');
      _.each(items, function(item) {
        var parts = item.innerText.trim().split(':');
        if (parts.length !== 2) return;

        switch(parts[0]) {
          case '作者': book.author = parts[1]; break;
          case 'ISBN': book.isbn = parts[1]; break;
          case '出版社': book.publishBy = parts[1]; break;
          case '出版时间': book.publishDate = parts[1]; break;
        }
      });

      book.info = angular.element(doc.getElementsByClassName('text-info')[0])
                         .next().text().trim();;

      items = doc.getElementsByClassName('table-responsive')[0]
                 .getElementsByTagName('tbody')[0]
                 .getElementsByTagName('tr');
      book.records = _.map(items, function(item) {
        var tds = item.getElementsByTagName('td');
        var record = {
          owner:  tds[0].innerText.trim(),
          type:   tds[1].innerText.trim(),
          state:  tds[2].innerText.trim(),
          depart: tds[3].innerText.trim(),
          id:     tds[4].innerText.trim()
        };
        if (record.state === '归还') {
          if (record.type === '参考外借资料') book.isCK = true;
          if (record.type === '普通外借资料') book.isPT = true;
        }
        return record;
      });

      book.isDone = true;
      return book;
    })
    .then(ShLib.Image.setData)
    .then(function(book) {
      if (book.imgData.length > 0) return book;
      if (book.isbn.length === 0)  return book;

      // otherwise, try to get image from china-pub!
      return ShLib.Image.getURLFromChinaPub(book.isbn)
        .then(function(img) {
          book.img = img;
          return book;
        });
    })
    .then(ShLib.Image.setData)
    .catch(function(e) {
      console.log(e.message);
      return book;
    });
};

angular.module('Services')
.service('ShLib', [ '$http', '$q', 'Image', function($http, $q, Image) {
  ShLib.$http = $http;
  ShLib.$q = $q;
  ShLib.Image = Image;
  return ShLib;
}]);
