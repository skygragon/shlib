var ShLib = {};

var BOOKS_SEARCH_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?index=.TW&term={term}&page={page}';
var BOOK_SEARCH_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?uri={uri}';
var BOOK_ISBN_URL = 'http://ipac.library.sh.cn/ipac20/ipac.jsp?index=ISBN&term={isbn}';
var BOOK_WX_URL = 'http://reg.library.sh.cn/SHLIBWX/servlet/ShlibServlet?bookid={id}&apid=ShlibBookDetailServiceImpl';

ShLib.searchBooks = function(term, page) {
  var url = BOOKS_SEARCH_URL.replace('{term}', term.replace(/\s+/g, '+'))
                            .replace('{page}', page + 1);

  console.log('get url: ' + url);
  return this.$http.get(url)
    .then(function(resp) {
      var doc = new DOMParser().parseFromString(resp.data, 'text/html');

      var books = _.map(doc.getElementsByClassName('mediumBoldAnchor'), function(x) {
        var book= {
          name: x.innerText.trim(),
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

        return book;
      });

      if (books.length === 0) return books;

      var n = Number(doc.getElementsByClassName('normalBlackFont2')[0]
                        .getElementsByTagName('b')[0]
                        .innerText.trim());

      // FIXME: a ugly hack to complete book's info!! ipac's webpage is hard
      //        to analyze because it uses lots of nested tables =.=
      var attrs = _.map(doc.getElementsByClassName('normalBlackFont1'), function(x) {
        return x.innerText.trim();
      });

      var i = 0; 
      for (var j = 0; j < attrs.length; ++j) {
        if (attrs[j].startsWith('著者')) {
          books[i].rawAuthor = attrs[j];
          books[i].rawPublish = attrs[j + 1];
          books[i].idxAll = n;
          ++i;
        }
      }

      return books;
    }, function(resp) {
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
      var doc = new DOMParser().parseFromString(resp.data, 'text/html');

      var id = doc.getElementsByName('QRCode')[0]
                  .attributes['src'].value
                  .split('bib=').pop();
      book.id = id;

      return ShLib.getBookById(book);
    });
};

ShLib.getBookById = function(book) {
    var url = BOOK_WX_URL.replace('{id}', book.id);
    console.log('get url: ' + url);

    return ShLib.$http.get(url)
      .then(function(resp) {
        var doc = new DOMParser().parseFromString(resp.data, 'text/html');

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
      });
};

angular.module('Services', [])
.service('ShLib', [ '$http', '$q' ,function($http, $q) {
  ShLib.$http = $http;
  ShLib.$q = $q;
  return ShLib;
}]);
