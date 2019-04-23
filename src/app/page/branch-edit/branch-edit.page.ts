import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController, LoadingController, ModalController, ToastController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {Branch} from '../../model/branch';
import {map, take} from 'rxjs/operators';
import * as firebase from 'firebase';
import {CalendarPlanSelectPage} from '../calendar-plan-select/calendar-plan-select.page';
import {CalendarPlan} from '../../model/calendar-plan';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-branch-edit',
  templateUrl: './branch-edit.page.html',
  styleUrls: ['./branch-edit.page.scss'],
})
export class BranchEditPage implements OnInit {

  @ViewChild('emailInput') emailInput;

  id: string;
  form: FormGroup;
  ref: Observable<Branch>;

  enablePermissionAdd: boolean;
  permissionEmail: string;
  permissions: any[];

  suggestedPlans: Observable<CalendarPlan[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.ref = afs.doc<Branch>(`branch/${this.id}`).valueChanges();
    this.suggestedPlans = afs.collection(`calendarPlan`,
      q => q.where('branchId', '==', this.id)).valueChanges();
  }

  ngOnInit() {
    this.ref.pipe(take(1)).subscribe((data: any) => {
      setTimeout(_ => {
        this.form.patchValue(data);
        this.permissions = data.permissions;
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
    });
  }

  async save() {
    const loading = await this.loadingCtrl.create({message: 'Aguarde...'});
    await loading.present();

    const ref = this.afs.doc<Branch>(`branch/${this.id}`);
    ref.update({
      ...this.form.value,
      updatedAt: moment().format('DD/MM/YYYY HH:mm'),
    }).then(_ => {
      loading.dismiss();
      this.router.navigate(['/branch', 'list']);
    }, error => {
      console.log(error);
      loading.dismiss();
    });
  }

  async remove() {
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

            const ref = this.afs.doc<Branch>(`branch/${this.id}`);
            ref.delete().then(async _ => {
              const c0 = await this.afs.collection(`calendarPlan`).ref.where('branchId', '==', this.id).get();
              c0.forEach(snap => {
                snap.ref.delete();

                ['events', 'periods', 'topics'].forEach(async collection => {
                  const c1 = await this.afs.collection(`${collection}`).ref.where('planId', '==', snap.id).get();
                  c1.forEach(s => s.ref.delete());
                });
              });

              loading.dismiss();
              this.router.navigate(['/branch/list']);
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

  async savePermission() {
    if (this.permissionEmail && this.permissionEmail.trim() !== '' && this.permissionEmail.indexOf('@') > 0) {
      this.afs.doc<Branch>(`branch/${this.id}`).update({
        'permissions': firebase.firestore.FieldValue.arrayUnion({
          email: this.permissionEmail,
          role: 'operator'
        })
      }).then(_ => {
        this.enablePermissionAdd = false;
        this.permissionEmail = '';
        this.permissions.push({email: this.permissionEmail, role: 'operator'});
      }, error => {
        console.log(error);
      });
    } else {
      const toast = await this.toastCtrl.create({message: 'E-mail inválido', duration: 3000});
      toast.present();
    }
  }

  async removePermission(permission) {
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
            this.afs.doc<Branch>(`branch/${this.id}`).update({
              'permissions': firebase.firestore.FieldValue.arrayRemove(permission)
            }).then(_ => {
              const index = this.permissions.indexOf(permission);
              if (index !== -1) {
                this.permissions.splice(index, 1);
              }
            }, async error => {
              console.log(error);
              const toast = await this.toastCtrl.create({message: 'Não foi possível excluir...', duration: 3000});
              toast.present();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  toggleEnablePermissionAdd() {
    this.enablePermissionAdd = !this.enablePermissionAdd;
    setTimeout(() => {
      this.emailInput.setFocus();
    }, 100);
  }

  async listAvailablePlans() {
    const modal = await this.modalCtrl.create({
      component: CalendarPlanSelectPage,
      componentProps: {value: ''}
    });
    modal.onDidDismiss().then(async r => {
      if (r && r.data) {
        const loading = await this.loadingCtrl.create({message: 'Aguarde...'});
        await loading.present();
        const planId = r.data.planId;

        const data: CalendarPlan = await this.afs.doc(`calendarPlan/${planId}`).valueChanges().pipe(take(1)).toPromise();

        const now = moment().format('DD/MM/YYYY HH:mm');
        const name = this.authService.getAuthInfo().name;

        data.createdAt = now;
        data.updatedAt = now;
        data.originalId = planId;
        data.revised = true;
        data.revisedAt = now;
        data.revisedBy = name;

        this.permissions = this.permissions.filter(item => item.email !== this.authService.getAuthInfo().email);
        const truncatedBranchId = this.id.substring(0, 5);

        data.id = `${planId}_${truncatedBranchId}`;
        data.branchId = this.id;
        data.branchName = this.form.controls.name.value;
        data.permissions = this.permissions;

        const ref = this.afs.doc<CalendarPlan>(`calendarPlan/${planId}_${truncatedBranchId}`);
        await ref.set(data);

        ['events', 'periods', 'topics'].forEach(async collection => {
          const list = await this.afs.collection(`${collection}`, q => q.where('planId', '==', planId
          )).snapshotChanges().pipe(
            take(1),
            map((items, index) => items.map(a => {
              const payload = a.payload.doc.data() as Object;
              const id = a.payload.doc.id;
              return {id, ...payload};
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
            const loading = await this.loadingCtrl.create({message: 'Aguarde...'});
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
