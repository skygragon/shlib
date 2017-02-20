angular.module('Controllers')
.controller('ScanController', function($scope, $ionicLoading, $cordovaBarcodeScanner,
      $state, ShLib, Stat) {

  $scope.scan = function() {
    $scope.books = [];
    $cordovaBarcodeScanner.scan()
      .then(function(data) {
        $ionicLoading.show();
        var book = {
          isbn: data.text
        };
        ShLib.getBook(book)
          .then(function(books) {
            $ionicLoading.hide();
            if (!books || books.length === 0) {
              return $ionicLoading.show({
                template: '没有找到图书记录',
                duration: 2000
              });
            } else if (books.length === 1) {
              Stat.books.selected = books[0];
              $state.go('app.book');
            } else {
              $scope.books = books;
            }
          });
      }, function(e) {
        $ionicLoading.show({
          template: '条形码扫描失败',
          duration: 2000
        });
      });
  };

  $scope.select = function(book) {
    Stat.books.selected = book;
  };

  $scope.books = [];
});
