import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

@Injectable()
export class UIService {
  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) {}

  showLoading(msg) {
    let loading = this.loadingCtrl.create({ spinner: 'bubbles', content: msg });
    loading.present();
    return loading;
  }

  showMessage(msg) {
    let toast = this.toastCtrl.create({ message: msg, duration: 3000, position: 'middle' });
    toast.present();
  }
}
