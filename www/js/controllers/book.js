angular.module('Controllers')
.controller('BookController', function($scope, $ionicLoading,
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

  $scope.star = function() {
    $ionicLoading.show();
    DB.updateBook($scope.book)
      .then(function(e) {
        $ionicLoading.hide();

        if (!e) {
          Stat.markDirty();
          Stat.books.ids.push($scope.book.id);
        }

        $ionicLoading.show({
          template: e || '已收藏',
          duration: 2000
        });
      });
  };

  $scope.unstar = function() {
    $ionicLoading.show();
    DB.deleteBook($scope.book)
      .then(function(e) {
        $ionicLoading.hide();

        if (!e) {
          Stat.markDirty();
          var i = Stat.books.ids.indexOf($scope.book.id);
          if (i >= 0) Stat.books.ids.splice(i, 1);
        }

        $ionicLoading.show({
          template: e || '已取消收藏',
          duration: 2000
        });
      });

  };

  var book = Stat.books.selected;

  if (!book.isDone) {
    $scope.fetch(book);
  } else {
    $scope.book = book;
  }

  $scope.isStared = function() {
    return $scope.book && Stat.books.ids.indexOf($scope.book.id) >= 0;
  };
});
