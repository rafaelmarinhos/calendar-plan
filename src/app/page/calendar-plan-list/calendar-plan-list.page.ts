import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CalendarPlan } from '../../model/calendar-plan';
import { AuthService } from '../../service/auth.service';

export const callback = map((items: any) => items.map(a => {
  const data = a.payload.doc.data() as CalendarPlan;
  const id = a.payload.doc.id;
  return { id, ...data };
}));

@Component({
  selector: 'app-calendar-plan-list',
  templateUrl: './calendar-plan-list.page.html',
  styleUrls: ['./calendar-plan-list.page.scss'],
})
export class CalendarPlanListPage implements OnInit {

  items: Observable<any[]>;

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    this.items = this.afs.collection('calendarPlan',
      q => q.where('permissions', 'array-contains', { email: this.authService.getAuthInfo().email, role: 'manager' })
    ).snapshotChanges(['added', 'removed']).pipe(callback);
  }

  ngOnInit() {
  }
}
