import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {MatDatepickerInputEvent} from '@angular/material';
import {AUDIENCE_INFO, CalendarPlanEvent, SEASON_INFO} from '../../model/calendar-plan-event';
import {LoadingController} from '@ionic/angular';

function endsAtAfterStartsAt(): ValidatorFn {
  return (control: FormGroup): { [key: string]: any } | null => {
    const d1 = control.get('startsAt').value;
    const d2 = control.get('endsAt').value;
    if (!d2) {
      return null;
    }

    const startsAt = moment(d1 + ' 00:00', 'DD/MM/YYYY HH:mm');
    const endsAt = moment(d2 + ' 23:59', 'DD/MM/YYYY HH:mm');
    const valid = endsAt.isAfter(startsAt);
    return valid ? null : {'endsAtAfterStartsAt': {value: control.value}};
  };
}

@Component({
  selector: 'app-calendar-event-create',
  templateUrl: './calendar-event-create.page.html',
  styleUrls: ['./calendar-event-create.page.scss'],
})
export class CalendarEventCreatePage implements OnInit {

  planId: string;
  form: FormGroup;
  seasons: any;
  audiences: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');
    this.seasons = SEASON_INFO;
    this.audiences = AUDIENCE_INFO;
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
      season: ['', {validators: Validators.required}],
      audience: ['', {validators: Validators.required}],
      startsAt: ['', {validators: Validators.required}],
      endsAt: [''],
      planId: [this.planId]
    }, {
      validator: endsAtAfterStartsAt()
    });
  }

  async save() {
    const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    await loading.present();

    const ref = this.afs.collection<CalendarPlanEvent>(`events`);
    ref.add({
      ...this.form.value,
      createdAt: moment().format('DD/MM/YYYY HH:mm'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    }).then(_ => {
      loading.dismiss();
      this.router.navigate(['/calendarEvent', 'list', this.planId]);
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
