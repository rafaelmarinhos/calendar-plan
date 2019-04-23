import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../../service/auth.service';
import {CalendarPlan} from '../../model/calendar-plan';
import * as moment from 'moment';

@Component({
  selector: 'app-branch-create',
  templateUrl: './branch-create.page.html',
  styleUrls: ['./branch-create.page.scss'],
})
export class BranchCreatePage implements OnInit {

  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private authService: AuthService
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
      name: ['', {validators: Validators.required}],
    });
  }

  async save() {
    const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    await loading.present();

    const ref = this.afs.collection<CalendarPlan>('branch');
    ref.add({
      ...this.form.value,
      createdAt: moment().format('DD/MM/YYYY HH:mm'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm'),
      owner: this.authService.getAuthInfo().email,
      permissions: [{email: this.authService.getAuthInfo().email, role: 'manager'}]
    }).then(_ => {
      loading.dismiss();
      this.router.navigate(['/branch', 'list']);
    }, error => {
      console.log(error);
      loading.dismiss();
    });
  }
}
