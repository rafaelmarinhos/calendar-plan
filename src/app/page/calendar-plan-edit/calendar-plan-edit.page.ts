import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { CalendarPlan } from '../../model/calendar-plan';
import { map, take } from 'rxjs/operators';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { ActionSheetController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { CalendarPlanSelectPage } from '../calendar-plan-select/calendar-plan-select.page';
import { BranchSelectPage } from '../branch-select/branch-select.page';
import { AuthService } from '../../service/auth.service';
import { CalendarPlanEvent } from '../../model/calendar-plan-event';

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
  selector: 'app-calendar-plan-edit',
  templateUrl: './calendar-plan-edit.page.html',
  styleUrls: ['./calendar-plan-edit.page.scss'],
})
export class CalendarPlanEditPage implements OnInit {

  id: string;
  form: FormGroup;
  ref: Observable<CalendarPlan>;

  suggestedPlans: Observable<CalendarPlan[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.ref = afs.doc<CalendarPlan>(`calendarPlan/${this.id}`).valueChanges();

    this.suggestedPlans = afs.collection(`calendarPlan`, q => q.where('originalId', '==', this.id)).snapshotChanges().pipe(
      map((items: any) => items.map(a => {
        const data = a.payload.doc.data() as CalendarPlan;
        const id = a.payload.doc.id;
        const pendingRevision = moment(data.updatedAt, 'DD/MM/YYYY HH:mm').isAfter(moment(data.revisedAt, 'DD/MM/YYYY HH:mm'));
        return { id, ...data, pending: pendingRevision };
      }))
    );
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
      name: ['', { validators: Validators.required }],
      startsAt: ['', { validators: Validators.required }],
      endsAt: ['', { validators: Validators.required }]
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
    const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
    await loading.present();

    const ref = this.afs.doc<CalendarPlan>(`calendarPlan/${this.id}`);
    const data = {
      ...this.form.value,
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    };
    ref.update(data).then(async _ => {
      if (propagate) {
        const c1 = await this.afs.collection(`calendarPlan`).ref.where('originalId', '==', this.id).get();
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
          role: 'cancel'
        }, {
          text: 'Sim',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
            await loading.present();

            const ref = this.afs.doc<CalendarPlan>(`calendarPlan/${this.id}`);
            ref.delete().then(async _ => {
              if (propagate) {
                const c0 = await this.afs.collection(`calendarPlan`).ref.where('originalId', '==', this.id).get();
                c0.forEach(snap => snap.ref.delete());

                ['events', 'periods', 'topics'].forEach(async collection => {
                  const c1 = await this.afs.collection(`${collection}`).ref.where('planId', '==', this.id).get();
                  c1.forEach(s => s.ref.delete());

                  const c2 = await this.afs.collection(`${collection}`).ref.where('originalPlanId', '==', this.id).get();
                  c2.forEach(s => s.ref.delete());
                });
              }
              loading.dismiss();
              this.router.navigate(['/calendarPlan/list']);
            }, error => {
              console.log(error);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async listAvailableBranches() {
    const modal = await this.modalCtrl.create({
      component: BranchSelectPage,
      componentProps: { value: '' }
    });
    modal.onDidDismiss().then(async r => {
      if (r && r.data) {
        const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
        await loading.present();
        const planId = this.id;

        const data: CalendarPlan = await this.afs.doc(`calendarPlan/${planId}`).valueChanges().pipe(take(1)).toPromise();

        const now = moment().format('DD/MM/YYYY HH:mm');
        const name = this.authService.getAuthInfo().name;

        data.createdAt = now;
        data.updatedAt = now;
        data.originalId = planId;
        data.revised = true;
        data.revisedAt = now;
        data.revisedBy = name;

        r.data.selectedBranches.forEach(async branch => {
          branch.permissions = branch.permissions.filter(item => item.email !== this.authService.getAuthInfo().email);
          const truncatedBranchId = branch.id.substring(0, 5);

          data.id = `${planId}_${truncatedBranchId}`;
          data.branchId = branch.id;
          data.branchName = branch.name;
          data.permissions = branch.permissions;

          const ref = this.afs.doc<CalendarPlan>(`calendarPlan/${planId}_${truncatedBranchId}`);
          await ref.set(data);

          ['events', 'periods', 'topics'].forEach(async collection => {
            const list = await this.afs.collection(`${collection}`, q => q.where('planId', '==', planId
            )).snapshotChanges().pipe(
              take(1),
              map((items, index) => items.map(a => {
                const payload = a.payload.doc.data() as Object;
                const id = a.payload.doc.id;
                return { id, ...payload };
              }))
            ).toPromise();
            list.forEach(async (item: any) => {
              item.planId = `${planId}_${truncatedBranchId}`;
              item.originalPlanId = planId;
              item.originalId = item.id;
              item.id = `${item.id}_${truncatedBranchId}`;
              if (collection === 'topics') {
                item.eventId = `${item.eventId}_${truncatedBranchId}`;
              }
              await this.afs.doc(`${collection}/${item.id}`).set(item);
            });
          });
        });
        loading.dismiss();
      }
    });
    return await modal.present();
  }

  async removeSuggestion(plan) {
    const alert = await this.alertCtrl.create({
      header: 'Confirma exclusão?',
      message: 'Essa ação é <strong>irreversível</strong>!',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
        },
        {
          text: 'Sim',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Aguarde...' });
            await loading.present();

            await this.afs.doc<CalendarPlan>(`calendarPlan/${plan.id}`).delete();
            ['events', 'periods', 'topics'].forEach(async collection => {
              const c1 = await this.afs.collection(`${collection}`).ref.where('planId', '==', plan.id).get();
              c1.forEach(s => s.ref.delete());
            });
            loading.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }
}
