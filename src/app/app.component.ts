import { Component, ViewChild } from '@angular/core';
import { App, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { BooksPage } from '../pages/books/books';
import { SearchPage } from '../pages/search/search';
import { ScanPage } from '../pages/scan/scan';

import { FileService } from '../services/file';
import { UIService } from '../services/ui';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  lastBack: number;
  rootPage: any = HomePage;
  pages: Array<any>;

  constructor(
    public app: App,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public file: FileService,
    public ui: UIService
  ) {
    this.initializeApp();
    this.pages = [ HomePage, BooksPage, SearchPage, ScanPage ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.platform.registerBackButtonAction(() => {
      let _overlay = this.app._appRoot._overlayPortal.getActive();
      let _nav = this.app.getActiveNav();

      if (_overlay && _overlay.dismiss) return _overlay.dismiss();
      if (_nav.canGoBack()) return _nav.pop();
      if (Date.now() - this.lastBack < 800) return this.platform.exitApp();

      this.ui.showMessage('再按一次退出');
      this.lastBack = Date.now();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page);
  }

  backup() {
    this.file.save()
      .then(
        f => this.ui.showMessage('数据备份成功!\n' + f),
        e => this.ui.showMessage('数据备份失败!\n' + e.message)
      );
  }

  restore() {
    this.file.load()
      .then(
        f => this.ui.showMessage('备份恢复成功!\n' + f),
        e => this.ui.showMessage('备份恢复失败!\n' + e.message)
      );
  }
}
