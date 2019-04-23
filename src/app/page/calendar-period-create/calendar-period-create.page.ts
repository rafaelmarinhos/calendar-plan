import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material';
import { CalendarPeriod } from '../../model/calendar-period';
import { LoadingController } from '@ionic/angular';

function endsAtAfterStartsAt(): ValidatorFn {
  return (control: FormGroup): { [key: string]: any } | null => {
    const d1 = control.get('startsAt').value;
    const d2 = control.get('endsAt').value;
    const startsAt = moment(d1 + ' 00:00', 'DD/MM/YYYY HH:mm');
    const endsAt = moment(d2 + ' 23:59', 'DD/MM/YYYY HH:mm');
    const valid = endsAt.isAfter(startsAt);
    return valid ? null : { 'endsAtAfterStartsAt': { value: control.value } };
  };
}

@Component({
  selector: 'app-calendar-period-create',
  templateUrl: './calendar-period-create.page.html',
  styleUrls: ['./calendar-period-create.page.scss'],
})
export class CalendarPeriodCreatePage implements OnInit {

  planId: string;
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');
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
      periodType: ['', { validators: Validators.required }],
      startsAt: ['', { validators: Validators.required }],
      endsAt: ['', { validators: Validators.required }],
      planId: [this.planId],
    }, {
        validator: endsAtAfterStartsAt()
      });
  }

  async save() {
    const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    await loading.present();

    const ref = this.afs.collection<CalendarPeriod>(`periods`);
    ref.add({
      ...this.form.value,
      createdAt: moment().format('DD/MM/YYYY HH:mm'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    }).then(_ => {
      loading.dismiss();
      this.router.navigate(['/calendarPeriod', 'list', this.planId]);
    }, error => {
      console.log(error);
      loading.dismiss();
    });
  }

  updateStartsAt(event: MatDatepickerInputEvent<Date>) {
    const date = moment(event.value).format('DD/MM/YYYY');
    this.form.controls.startsAt.setValue(date);
  }

  updateEndsAt(event: MatDatepickerInputEvent<Date>) {
    const date = moment(event.value).format('DD/MM/YYYY');
    this.form.controls.endsAt.setValue(date);
  }
}
