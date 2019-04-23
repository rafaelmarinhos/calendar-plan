import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import UserCredential = firebase.auth.UserCredential;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  form: FormGroup;

  constructor(
    private authService: AuthService,
    private afs: AngularFirestore,
    private alertCtrl: AlertController,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
  }

  get f(): any {
    return this.form.controls;
  }

  async ionViewWillEnter() {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: ['', {validators: [Validators.required, Validators.minLength(3)]}],
      email: ['', {validators: [Validators.required, Validators.email]}],
      password: ['', {validators: [Validators.required, Validators.minLength(6)]}],
    });
  }

  signUp() {
    const credentials = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value
    };

    this.authService.emailSignUp(credentials).then(async (auth: UserCredential) => {
      await this.authService.emailLogin(credentials);

      const name = this.form.controls.name.value;
      auth.user.updateProfile({
        displayName: name,
        photoURL: null
      }).then(_ => this.authService.setAuthInfoProperty('name', name));
      this.router.navigate(['/home'], {replaceUrl: true});
    }, async error => {
      this.form.controls.email.setValue('');
      this.form.controls.password.setValue('');
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Não foi possível cadastrar esse e-mail. Ele pode já estar em uso.',
        buttons: ['OK']
      });
      await alert.present();
      console.log(error);
    });
  }

}
