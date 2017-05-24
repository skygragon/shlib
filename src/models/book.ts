export class Record {
  id: string = '';
  owner: string = '';
  depart: string = '';
  type: string = '';
  state: string = '';
  color: string = 'danger';
}

export class Book {
  id: string = '';
  name: string = '';
  uri: string = '';

  isbn: string = '';
  info: string = '';
  img: string[] = [];
  imgData: string = '';
  rawAuthor: string = '';
  rawPublish: string = '';
  author: string = '';
  publishBy: string = '';
  publishDate: string = '';
  records: Record[] = [];

  idx: number = -1;
  idxAll: number = 0;

  isCK: boolean = false;  // 可参考外借
  isPT: boolean = false;  // 可普通外借
  isDone: boolean = false; // 已更新全部信息
}
