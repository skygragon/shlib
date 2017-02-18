angular.module('Controllers')
.controller('DashboardController', function($scope, $ionicLoading, DB) {
  DB.countBooks()
    .then(function(count) {
      $scope.count = count;
    });

  $scope.count = {
    all: 0,
    ck: 0,
    pt: 0
  };
});
