import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../service/auth.service';
import {Router} from '@angular/router';
import {AlertController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form: FormGroup;

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
  }

  get f(): any {
    return this.form.controls;
  }

  async ionViewWillEnter() {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      email: ['', {validators: [Validators.required, Validators.email]}],
      password: ['', {validators: [Validators.required, Validators.minLength(6)]}],
    });
  }

  ngOnInit() {

  }

  emailLogin() {
    const credentials = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value
    };

    this.authService.emailLogin(credentials).then(_ => {
      this.router.navigate(['/home'], {replaceUrl: true});
    }, async error => {
      this.form.controls.email.setValue('');
      this.form.controls.password.setValue('');
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Não foi possível entrar com essa conta. Tente via Facebook ou Google.',
        buttons: ['OK']
      });
      await alert.present();
      console.log(error);
    });
  }

  googleLogin() {
    this.authService.googleLogin().then(_ => {
      this.router.navigate(['/home'], {replaceUrl: true});
    }, async error => {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Não foi possível entrar com essa conta. Tente via Facebook.',
        buttons: ['OK']
      });
      await alert.present();
      console.log(error);
    });
  }

  facebookLogin() {
    this.authService.facebookLogin().then(_ => {
      this.router.navigate(['/home'], {replaceUrl: true});
    }, async error => {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Não foi possível entrar com essa conta. Tente via Google.',
        buttons: ['OK']
      });
      await alert.present();
      console.log(error);
      console.log(error);
    });
  }
}
