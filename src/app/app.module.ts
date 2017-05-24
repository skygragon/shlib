import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { BookPage } from '../pages/book/book';
import { BooksPage } from '../pages/books/books';
import { SearchPage } from '../pages/search/search';
import { ScanPage } from '../pages/scan/scan';

import { DBService } from '../services/db';
import { ImageService } from '../services/image';
import { SHLibService } from '../services/shlib';
import { UIService } from '../services/ui';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    BookPage,
    BooksPage,
    SearchPage,
    ScanPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    BookPage,
    BooksPage,
    SearchPage,
    ScanPage
  ],
  providers: [
    BarcodeScanner,
    DBService,
    ImageService,
    SHLibService,
    UIService,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})

export class AppModule {}
