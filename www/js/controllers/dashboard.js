angular.module('Controllers')
.controller('DashboardController', function($scope, $rootScope,
      $ionicLoading, DB, Stat) {

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'app.dashboard' && Stat.dirty.dashboard)
        $scope.refreshCount();
    });

  $scope.count = {
    all: 0,
    avail: 0,

    ck: 0,
    pt: 0,
  };

  $scope.refreshCount = function() {
    $ionicLoading.show();
    DB.getBooks()
      .then(function(books) {
        $ionicLoading.hide();

        $scope.count.all = books.length;
        $scope.count.avail = books.filter(function(book) {
          return book.isCK || book.isPT;
        }).length;
        $scope.count.ck = books.filter(function(book) {
          return book.isCK;
        }).length;
        $scope.count.pt = books.filter(function(book) {
          return book.isPT;
        }).length;

        Stat.books.ids = books.map(function(book) {
          return book.id;
        });
        Stat.dirty.dashboard = false;
      });
  };

  $scope.update = function() {
    $ionicLoading.show();
    Stat.update().then(function(results) {
      $ionicLoading.hide();

      console.log('Books updated: ' + JSON.stringify(results));
      $scope.refreshCount();
    });
  };

  $scope.refreshCount();
});
