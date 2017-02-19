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

Stat.update = function() {
  return DB.getBooks()
    .then(function(books) {
      var promises = books.map(function(book) {
        return Stat.ShLib
          .getBookById(book)
          .then(Stat.DB.updateBook);
      });
      return Stat.$q.all(promises);
    });
};

angular.module('Services')
.service('Stat', [ '$q', 'DB', 'ShLib', function($q, DB, ShLib) {
  Stat.$q = $q;
  Stat.DB = DB;
  Stat.ShLib = ShLib;
  return Stat;
}]);
