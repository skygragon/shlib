var DB = {};

DB.init = function($q) {
  this.$q = $q;
  this.db = null;
};

DB.open = function() {
  var d = this.$q.defer();

  var db = new Dexie('shlib.db');
  db.version(1).stores({
    books: 'id'
  });

  db.open()
    .then(function(db) {
      DB.db = db;
      d.resolve(db);
    })
    .catch(function(e) {
      console.log('db open failed:', e.stack);
      d.reject(e);
    });

  return d.promise;
};

DB.getBooks = function() {
  return this.db.books.toCollection().toArray();
};

DB.countBooks = function() {
  return DB.getBooks()
    .then(function(books) {
      return {
        all: books.length,
        ck: books.filter(function(book) {
          return book.isCK;
        }).length,
        pt: books.filter(function(book) {
          return book.isPT;
        }).length
      };
    });
};

DB.updateBook = function(book) {
  var d = this.$q.defer();

  this.db
      .books
      .put(book)
      .then(function(id) {
        d.resolve();
      })
      .catch(function(e) {
        d.resolve(e);
      });
       
  return d.promise;
};

angular.module('Services')
.service('DB', [ '$q' ,function($q) {
  DB.init($q);
  return DB;
}]);
