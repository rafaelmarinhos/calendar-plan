import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AngularFireAuth} from '@angular/fire/auth';
import {AuthService} from './service/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  authInfo: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.afAuth.authState.subscribe(data => {
        console.log('AuthState changed', (data == null ? null : data.uid));
        if (data != null && data.uid != null) {
          const user = {
            id: data.uid,
            name: data.displayName,
            email: data.email,
            photoUrl: data.photoURL
          };
          this.authService.setAuthInfo(user);
          this.authInfo = user;
        } else {
          this.authInfo = null;
          this.authService.setAuthInfo(null);
        }
      },
      error => {
        console.error(error);
      });
    });
  }

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
