import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {CalendarPeriod} from '../../model/calendar-period';
import {MatDatepickerInputEvent} from '@angular/material';
import {CalendarPlan} from '../../model/calendar-plan';
import {map, take} from 'rxjs/operators';
import {CalendarPlanEvent} from '../../model/calendar-plan-event';
import {Observable} from 'rxjs';
import {ActionSheetController, AlertController, LoadingController} from '@ionic/angular';

function endsAtAfterStartsAt(): ValidatorFn {
  return (control: FormGroup): { [key: string]: any } | null => {
    const d1 = control.get('startsAt').value;
    const d2 = control.get('endsAt').value;
    const startsAt = moment(d1 + ' 00:00', 'DD/MM/YYYY HH:mm');
    const endsAt = moment(d2 + ' 23:59', 'DD/MM/YYYY HH:mm');
    const valid = endsAt.isAfter(startsAt);
    return valid ? null : {'endsAtAfterStartsAt': {value: control.value}};
  };
}

@Component({
  selector: 'app-calendar-period-edit',
  templateUrl: './calendar-period-edit.page.html',
  styleUrls: ['./calendar-period-edit.page.scss'],
})
export class CalendarPeriodEditPage implements OnInit {

  id: string;
  planId: string;
  form: FormGroup;
  ref: Observable<CalendarPeriod>;

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
    this.id = this.route.snapshot.paramMap.get('id');
    this.ref = afs.doc<CalendarPeriod>(`periods/${this.id}`).valueChanges();
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
      name: ['', {validators: Validators.required}],
      periodType: ['', {validators: Validators.required}],
      startsAt: ['', {validators: Validators.required}],
      endsAt: ['', {validators: Validators.required}]
    }, {
      validator: endsAtAfterStartsAt()
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

    const ref = this.afs.doc<CalendarPlan>(`periods/${this.id}`);
    const data = {
      ...this.form.value,
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    };
    ref.update(data).then(async _ => {
      if (propagate) {
        const c1 = await this.afs.collection(`periods`).ref.where('originalId', '==', this.id).get();
        c1.forEach(snap => snap.ref.update(data));
      }
      loading.dismiss();
      this.router.navigate(['/calendarPlan', 'list']);
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

            const ref = this.afs.doc<CalendarPeriod>(`periods/${this.id}`);
            ref.delete().then(async _ => {
              if (propagate) {
                const c1 = await this.afs.collection(`periods`).ref.where('originalId', '==', this.id).get();
                c1.forEach(snap => snap.ref.delete());
              }
              loading.dismiss();
              this.router.navigate(['/calendarPlan/list']);
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
