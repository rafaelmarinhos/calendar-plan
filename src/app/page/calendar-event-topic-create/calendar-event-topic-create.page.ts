import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import * as moment from 'moment';
import {CalendarEventTopic} from '../../model/calendar-event-topic';
import {Observable} from 'rxjs';
import {CalendarPlanEvent} from '../../model/calendar-plan-event';
import {map, take} from 'rxjs/operators';
import {CalendarPlan} from '../../model/calendar-plan';

export const callback = map((items: any) => items.map(a => {
  const data = a.payload.doc.data() as CalendarPlanEvent;
  const id = a.payload.doc.id;
  return {id, ...data};
}));

@Component({
  selector: 'app-calendar-event-topic-create',
  templateUrl: './calendar-event-topic-create.page.html',
  styleUrls: ['./calendar-event-topic-create.page.scss'],
})
export class CalendarEventTopicCreatePage implements OnInit {

  planId: string;
  eventId: string;
  form: FormGroup;
  private calendarPlan: Observable<CalendarPlan>;
  private calendarPlanEvent: CalendarPlanEvent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');
    this.eventId = this.route.snapshot.paramMap.get('eventId');

    this.calendarPlan = afs.doc<CalendarPlan>(`calendarPlan/${this.planId}`).valueChanges();
  }

  ngOnInit() {
    setTimeout(_ => {
      this.afs.doc<CalendarPlanEvent>(`events/${this.eventId}`).valueChanges().pipe(take(1)).subscribe(data => {
        this.calendarPlanEvent = data;
        this.form.controls.eventStartsAt.setValue(this.calendarPlanEvent.startsAt);
      });
    }, 100);
  }

  get f(): any {
    return this.form.controls;
  }

  async ionViewWillEnter() {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      title: ['', {validators: Validators.required}],
      subtitle: [''],
      eventId: [this.eventId],
      planId: [this.planId],
      eventStartsAt: [''],
      url: [''],
      sequence: [0]
    });
  }

  async save() {
    const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    await loading.present();

    const url: string = this.form.controls.url.value;
    if (url && url.trim() !== '' && !url.startsWith('http')) {
      this.form.controls.url.setValue('http://' + url);
    }

    const ref = this.afs.collection<CalendarEventTopic>(`topics`);
    ref.add({
      ...this.form.value,
      createdAt: moment().format('DD/MM/YYYY HH:mm'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    }).then(_ => {
      loading.dismiss();
      this.router.navigate(['/calendarEventTopic', 'list', this.planId, this.eventId]);
    }, error => {
      console.log(error);
      loading.dismiss();
    });
  }
}
