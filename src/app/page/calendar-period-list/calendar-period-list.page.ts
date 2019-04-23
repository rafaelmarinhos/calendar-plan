import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { PERIOD_TYPE_INFO } from '../../model/calendar-period';
import { CalendarPlan } from '../../model/calendar-plan';
import { CalendarPlanEvent } from '../../model/calendar-plan-event';

@Component({
  selector: 'app-calendar-period-list',
  templateUrl: './calendar-period-list.page.html',
  styleUrls: ['./calendar-period-list.page.scss'],
})
export class CalendarPeriodListPage implements OnInit {

  planId: string;
  calendarPlan: Observable<CalendarPlan>;
  calendarPeriods: any[];
  countPeriods: number;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');

    const ref = afs.doc<CalendarPlan>(`calendarPlan/${this.planId}`);
    this.calendarPlan = ref.valueChanges();

    this.calendarPeriods = [];
    this.countPeriods = 0;
    Object.keys(PERIOD_TYPE_INFO).forEach(key => {
      this.calendarPeriods.push({
        name: PERIOD_TYPE_INFO[key].name,
        ref: afs.collection(`periods`,
          q => q.where('periodType', '==', key).where('planId', '==', this.planId).orderBy('startDate')).snapshotChanges(['added', 'removed']).pipe(
            map((items: any) => items.map(a => {
              const data = a.payload.doc.data() as CalendarPlanEvent;
              const id = a.payload.doc.id;
              this.countPeriods++;
              return { id, ...data };
            }))
          )
      });
    });
  }

  ngOnInit() {
  }
}
