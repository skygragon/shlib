angular.module('Controllers')
.controller('BookController', function($scope, $stateParams, $ionicLoading,
      ShLib, Stat, DB) {

  $scope.fetch = function(book) {
    $ionicLoading.show();
    ShLib.getBookById(book)
      .then(function(book) {
        $ionicLoading.hide();

        $scope.book = book;
        console.log(JSON.stringify(book));
      });
  };

  $scope.save = function(book) {
    $ionicLoading.show();
    DB.updateBook(book)
      .then(function(e) {
        $ionicLoading.hide();
        
        $ionicLoading.show({
          template: e || '已收藏',
          duration: 2000
        });
      });
  };

  console.log(JSON.stringify($stateParams));
  var book = Stat.books.find(function(x) {
    return x.idx === Number($stateParams.bookIdx)
  });

  if (!book.isDone) {
    $scope.fetch(book);
  } else {
    $scope.book = book;
  }
});
