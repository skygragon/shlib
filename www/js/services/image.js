var Image = {};

Image.serialize = function(url) {
  return this.$http
    .get(url, {responseType: 'arraybuffer'})
    .then(function(resp) {
      return base64js.fromByteArray(new Uint8Array(resp.data));
    });
};

Image.parseFromBook = function(book) {
  if (!book) return '';
  if (book.imgData) return 'data:image/png;base64,' + book.imgData;
  return book.img;
};

angular.module('Services')
.service('Image', [ '$http', function($http) {
  Image.$http = $http;
  return Image;
}]);
