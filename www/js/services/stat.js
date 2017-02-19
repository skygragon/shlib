var Stat = {
  books: {
    selected: null, // current selected book to be displayed
    ids: []         // ids of the books saved in db
  },
  dirty: {
    dashboard: false, // need refresh count from DB again
    books: false,     // need refresh books from DB again
  }
};

Stat.setDirty = function() {
  this.dirty.dashboard = true;
  this.dirty.books = true;
};

angular.module('Services', [])
.service('Stat', [ function() {
  return Stat;
}]);
