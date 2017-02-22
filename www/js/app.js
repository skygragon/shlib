angular.module('starter', ['ionic', 'ngCordova', 'Controllers', 'Services'])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $ionicPlatform.registerBackButtonAction(function(e){
    if ($rootScope.backButtonPressedOnceToExit) {
      ionic.Platform.exitApp();
    } else if ($ionicHistory.backView()) {
      $ionicHistory.goBack();
    } else {
      $rootScope.backButtonPressedOnceToExit = true;
      $ionicLoading.show({
        template: '再按一次退出上图助手',
        duration: 750
      });
      setTimeout(function(){
        $rootScope.backButtonPressedOnceToExit = false;
      }, 1500);
    }
    e.preventDefault();
    return false;
  }, 101);

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppControler'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'SearchController'
      }
    }
  })

  .state('app.scan', {
    url: '/scan',
    views: {
      'menuContent': {
        templateUrl: 'templates/scan.html',
        controller: 'ScanController'
      }
    }
  })

  .state('app.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardController'
        }
      },
      resolve: {
        Database: function(DB) {
          return DB.open();
        }
      }
    })
    .state('app.books', {
      url: '/books/:type',
      views: {
        'menuContent': {
          templateUrl: 'templates/books.html',
          controller: 'BooksController'
        }
      }
    })

  .state('app.book', {
    url: '/book',
    views: {
      'menuContent': {
        templateUrl: 'templates/book.html',
        controller: 'BookController'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');
})

.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
