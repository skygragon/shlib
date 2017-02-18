var Stat = {
  books: {
    selected: [], // current selected books in the context
    ids: []       // ids of the books saved in db
  },
  dirty: {
    dashboard: false, // need refresh count from DB again
    books: false,     // need refresh books from DB again
  }
};

Stat.markDirty = function() {
  this.dirty.dashboard = true;
  this.dirty.books = true;
};

angular.module('Services')
.service('Stat', [ function() {
  return Stat;
}]);
