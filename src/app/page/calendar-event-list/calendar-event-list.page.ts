import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CalendarPlan} from '../../model/calendar-plan';
import {ActivatedRoute} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, take} from 'rxjs/operators';
import {AUDIENCE_INFO, CalendarPlanEvent, SEASON_INFO} from '../../model/calendar-plan-event';

export const callback = map((items: any) => items.map(a => {
  const data = a.payload.doc.data() as CalendarPlanEvent;
  const id = a.payload.doc.id;
  return {id, ...data};
}));

@Component({
  selector: 'app-calendar-event-list',
  templateUrl: './calendar-event-list.page.html',
  styleUrls: ['./calendar-event-list.page.scss'],
})
export class CalendarEventListPage implements OnInit {

  planId: string;
  calendarPlan: Observable<CalendarPlan>;
  calendarEvents: any[];

  seasonInfo = SEASON_INFO;
  audienceInfo = AUDIENCE_INFO;

  seasonId: string;
  audienceId: string;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');

    const ref = afs.doc<CalendarPlan>(`calendarPlan/${this.planId}`);
    this.calendarPlan = ref.valueChanges();
  }

  ngOnInit() {
    setTimeout(_ => {
      this.seasonId = Object.keys(SEASON_INFO)[1];
      this.audienceId = Object.keys(AUDIENCE_INFO)[0];
      this.filter();
    }, 300);
  }

  filter() {
    this.afs.collection(`events`,
      q => q.where('planId', '==', this.planId)
        .where('season', '==', this.seasonId)
        .where('audience', '==', this.audienceId)
    ).snapshotChanges(['added', 'removed']).pipe(take(1), callback).subscribe(list => {
      this.calendarEvents = list;
    });
  }
}
