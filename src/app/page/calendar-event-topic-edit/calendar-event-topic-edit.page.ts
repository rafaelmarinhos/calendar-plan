import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {AUDIENCE_INFO, CalendarPlanEvent} from '../../model/calendar-plan-event';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController, AlertController, LoadingController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, take} from 'rxjs/operators';
import {CalendarEventTopic} from '../../model/calendar-event-topic';
import * as moment from 'moment';
import {CalendarPeriod} from '../../model/calendar-period';
import {CalendarPlan} from '../../model/calendar-plan';

export const callback = map((items: any) => items.map(a => {
  const data = a.payload.doc.data() as CalendarPlanEvent;
  const id = a.payload.doc.id;
  return {id, ...data};
}));

@Component({
  selector: 'app-calendar-event-topic-edit',
  templateUrl: './calendar-event-topic-edit.page.html',
  styleUrls: ['./calendar-event-topic-edit.page.scss'],
})
export class CalendarEventTopicEditPage implements OnInit {

  planId: string;
  eventId: string;
  id: string;
  form: FormGroup;
  calendarEvents: Observable<any[]>;
  ref: Observable<CalendarEventTopic>;
  audienceInfo: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    this.id = this.route.snapshot.paramMap.get('id');
    this.audienceInfo = AUDIENCE_INFO;

    this.calendarEvents = afs.collection(`events`, q => q.where('planId', '==', this.planId)).snapshotChanges(['added', 'removed']).pipe(callback);
    this.ref = afs.doc<CalendarEventTopic>(`topics/${this.id}`).valueChanges();
  }

  ngOnInit() {
    this.ref.pipe(take(1)).subscribe((data: any) => {
      setTimeout(_ => {
        this.form.patchValue(data);
      }, 100);
    });
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
      eventStartsAt: [''],
      url: [''],
    });
  }

  async save() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Apenas este',
          icon: 'create',
          handler: async () => {
            this.update(false);
          }
        }, {
          text: 'Este e todos os sugeridos a partir dele',
          icon: 'apps',
          handler: () => {
            this.update(true);
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async update(propagate) {
    const loading = await this.loadingCtrl.create({message: 'Aguarde...'});
    await loading.present();

    const url: string = this.form.controls.url.value;
    if (url && url.trim() !== '' && !url.startsWith('http')) {
      this.form.controls.url.setValue('http://' + url);
    }

    const ref = this.afs.doc<CalendarPlan>(`topics/${this.id}`);
    const data = {
      ...this.form.value,
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    };
    ref.update(data).then(async _ => {
      if (propagate) {
        const c1 = await this.afs.collection(`topics`).ref.where('originalId', '==', this.id).get();
        c1.forEach(snap => snap.ref.update(data));
      }
      loading.dismiss();
      this.router.navigate(['/calendarEventTopic', 'list', this.planId, this.eventId]);
    }, error => {
      console.log(error);
      loading.dismiss();
    });
  }

  async remove() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Apenas este',
          icon: 'create',
          handler: async () => {
            this.delete(false);
          }
        }, {
          text: 'Este e todos os sugeridos a partir dele',
          icon: 'apps',
          handler: () => {
            this.delete(true);
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async delete(propagate) {
    const alert = await this.alertCtrl.create({
      header: 'Confirma exclusão?',
      message: 'Essa ação é <strong>irreversível</strong>!',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
        }, {
          text: 'Sim',
          handler: async () => {
            const loading = await this.loadingCtrl.create({message: 'Aguarde...'});
            await loading.present();

            const ref = this.afs.doc<CalendarPeriod>(`topics/${this.id}`);
            ref.delete().then(async _ => {
              if (propagate) {
                const c1 = await this.afs.collection(`topics`).ref.where('originalId', '==', this.id).get();
                c1.forEach(snap => snap.ref.delete());
              }
              loading.dismiss();
              this.router.navigate(['/calendarEventTopic/list', this.planId, this.eventId]);
            }, error => {
              console.log(error);
              loading.dismiss();
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
