import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import UserCredential = firebase.auth.UserCredential;

export class EmailPasswordCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authInfo: any;

  constructor(
    private afAuth: AngularFireAuth
  ) {
  }

  getAuthInfo() {
    return this.authInfo;
  }

  setAuthInfo(data) {
    this.authInfo = data;
  }

  setAuthInfoProperty(property, value) {
    if (this.authInfo) {
      this.authInfo[property] = value;
    }
  }

  emailSignUp(credentials: EmailPasswordCredentials): Promise<UserCredential> {
    return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
  }

  emailLogin(credentials: EmailPasswordCredentials): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  facebookLogin() {
    return this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider());
  }

  googleLogin() {
    return this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  signOut() {
    this.setAuthInfo(null);
    this.afAuth.auth.signOut();
  }
}
