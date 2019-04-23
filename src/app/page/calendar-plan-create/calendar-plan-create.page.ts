import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material';
import * as moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { CalendarPlan } from '../../model/calendar-plan';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../../service/auth.service';
import { CalendarPlanService } from 'src/app/service/calendar-plan.service';

function yearIsValid(): ValidatorFn {
  return (control: FormGroup): { [key: string]: any } | null => {
    const conclusionYear = control.get('conclusionYear').value;
    const valid = conclusionYear > 2000;
    return valid ? null : { 'yearIsValid': { value: conclusionYear } };
  };
}

@Component({
  selector: 'app-calendar-plan-create',
  templateUrl: './calendar-plan-create.page.html',
  styleUrls: ['./calendar-plan-create.page.scss'],
})
export class CalendarPlanCreatePage implements OnInit {

  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private authService: AuthService,
    private calendarPlanService: CalendarPlanService
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
      name: ['', { validators: Validators.required }],
      conclusionYear: ['', { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(4)] }],
      inquiry: ['', { validators: Validators.required }],
      examination: ['', { validators: Validators.required }]
    }, {
        validator: yearIsValid()
      });
  }

  async save() {
    const easterDate = this.calendarPlanService.getEasterDate(this.form.controls['conclusionYear'].value);

    const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    await loading.present();

    const ref = this.afs.collection<CalendarPlan>('calendarPlan');
    ref.add({
      ...this.form.value,
      createdAt: moment().format('DD/MM/YYYY HH:mm'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm'),
      originalId: '',
      easterDate: moment(easterDate).format('DD/MM/YYYY'),
      permissions: [
        { email: this.authService.getAuthInfo().email, role: 'manager' }
      ]
    }).then(_ => {

      const params = {
        inquiry: this.form.controls['inquiry'].value,
        examination: this.form.controls['examination'].value
      };

      this.calendarPlanService.createPeriods(_.id, easterDate, params);
      loading.dismiss();
      this.router.navigate(['/calendarPlan', 'list']);
    }, error => {
      console.log(error);
      loading.dismiss();
    });
  }
}
