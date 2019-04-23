import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
  ) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.afAuth.user.pipe(take(1)).subscribe(user => {
        if (user != null) {
          return resolve(true);
        } else {
          this.authService.signOut();
          this.router.navigate(['/login'], { replaceUrl: true });
          return resolve(false);
        }
      }, error => {
        console.log(error);
        this.authService.signOut();
        this.router.navigate(['/login'], { replaceUrl: true });
        return resolve(false);
      });
    });
  }
}
