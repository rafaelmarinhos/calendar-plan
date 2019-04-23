import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Observable} from 'rxjs';
import {callback} from '../calendar-plan-list/calendar-plan-list.page';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-calendar-plan-select',
  templateUrl: './calendar-plan-select.page.html',
  styleUrls: ['./calendar-plan-select.page.scss'],
})
export class CalendarPlanSelectPage implements OnInit {

  planId: string;
  items: Observable<any[]>;

  constructor(
    private modalCtrl: ModalController,
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    this.items = afs.collection('calendarPlan',
      q => q.where('permissions', 'array-contains', {email: this.authService.getAuthInfo().email, role: 'manager'})
    ).snapshotChanges(['added', 'removed']).pipe(callback);
  }

  ngOnInit() {
  }

  dismiss(proceed) {
    if (proceed) {
      this.modalCtrl.dismiss({
        planId: this.planId,
      });
    } else {
      this.modalCtrl.dismiss();
    }
  }

  updateSelected(id) {
    this.planId = id;
  }

}
