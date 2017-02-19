angular.module('Controllers')
.controller('SearchController', function($scope, $ionicLoading, $ionicLoading,
      $state, ShLib, Stat) {

  var ctx = {
    term: '',
    pageIdx: 0,
    hasPrev: false,
    hasNext: false
  };

  $scope.show = function(idx) {
    $scope.books = [];
    ctx.hasPrev = false;
    ctx.hasNext = false;

    $ionicLoading.show();

    ShLib.searchBooks(ctx.term, idx)
      .then(function(books) {
        $ionicLoading.hide();

        if (!books) return $ionicLoading.show({
            template: '查询馆藏失败，请检查网络连接',
            duration: 3000
        });

        if (books.length === 0) $ionicLoading.show({
          template: '未找到馆藏记录',
          duration: 3000
        });

        if (books.length === 1) {
          $scope.select(books[0]);
          $state.go('app.book');
          return;
        }

        $scope.books = books;

        ctx.pageIdx = idx;
        ctx.hasPrev = (idx > 0);
        ctx.hasNext = books.length > 0;
        if (ctx.hasNext) {
          var book = books[books.length - 1];
          ctx.hasNext = book.idx < book.idxAll;
        }
      });
  };

  $scope.select = function(book) {
    Stat.books.selected = book;
  };

  $scope.prev = function() {
    if (ctx.pageIdx <= 0) return;
    $scope.show(ctx.pageIdx - 1);
  };

  $scope.next = function() {
    $scope.show(ctx.pageIdx + 1);
  };

  $scope.books = [];
  $scope.ctx = ctx;
});
