angular.module('Controllers')
.controller('BooksController', function($scope, $ionicLoading, $stateParams,
      DB, Stat) {
  
  $scope.books = [];
  $ionicLoading.show();

  DB.getBooks()
    .then(function(books) {
      $ionicLoading.hide();

      switch($stateParams.type) {
        case 'ck':
          books = books.filter(function(book) {
            return book.isCK;
          });
          break;
        case 'pt':
          books = books.filter(function(book) {
            return book.isPT;
          });
          break;
        case 'can-borrow':
          books = books.filter(function(book) {
            return book.isPT || book.isCK;
          });
          break;
      }
      Stat.books = $scope.books = books;
    });
});
