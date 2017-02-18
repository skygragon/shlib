angular.module('Controllers')
.controller('BooksController', function($scope, $rootScope, $ionicLoading,
      $stateParams, DB, Stat) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'app.books' && Stat.dirty.books)
        $scope.refreshBooks();
    });
  
  $scope.refreshBooks = function() {
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

        Stat.books.selected = $scope.books = books;
        Stat.dirty.books = false;
      });
  };

  $scope.refreshBooks();
});
