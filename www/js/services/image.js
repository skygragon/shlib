var Image = {};

Image.setData = function(book) {
  if (book.imgData && book.imgData.length > 0) return book;

  console.log('download image: ' + book.img);
  return Image.$http
    .get(book.img, {responseType: 'arraybuffer'})
    .then(function(resp) {
      book.imgData = base64js.fromByteArray(new Uint8Array(resp.data));
      return book;
    });
};

Image.getData = function(book) {
  if (!book) return '';
  if (book.imgData) return 'data:image/png;base64,' + book.imgData;
  return book.img;
};

Image.getURLFromChinaPub = function(isbn) {
  var url = 'http://m.china-pub.com/touch/touchsearch.aspx?keyword=' + isbn;
  console.log('get url: ' + url);

  return Image.$http.get(url)
    .then(function(resp) {
      var doc = new DOMParser().parseFromString(resp.data, 'text/html');
      var img = doc.getElementsByClassName('aimg')[0]
                   .getElementsByTagName('img')[0]
                   .attributes['file'].value;
      return img;
    });
};

angular.module('Services')
.service('Image', [ '$http', function($http) {
  Image.$http = $http;
  return Image;
}]);
