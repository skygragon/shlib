import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';

import { DBService } from '../services/db';

@Injectable()
export class FileService {
  private dir: string;
  private name: string = 'shlib.json';

  constructor(
    private file: File,
    private db: DBService
  ) {
    let dir;
    try {
      dir = file.externalRootDirectory || file.externalDataDirectory || file.dataDirectory;
    } catch (e) {
      // FIXME: hack web test where no cordova defined...
      console.log(e.message);
    }
    this.dir = dir || './';
  }

  save() {
    return new Promise<any>((resolve, reject) =>
      this.db.getBooks()
        .then(books => this.file.writeFile(this.dir, this.name, JSON.stringify(books), {replace: true}))
        .then(ok => resolve(this.dir + this.name))
        .catch(reject)
    );
  }

  load() {
    return new Promise<any>((resolve, reject) =>
      this.file.readAsText(this.dir, this.name)
        .then(text => this.db.setBooks(JSON.parse(text)))
        .then(ok => resolve(this.dir + this.name))
        .catch(reject)
    );
  }
}
