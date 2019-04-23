import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CalendarPlan} from '../../model/calendar-plan';
import {ActivatedRoute} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {callback} from '../calendar-event-list/calendar-event-list.page';
import {AUDIENCE_INFO, CalendarPlanEvent, SEASON_INFO} from '../../model/calendar-plan-event';
import {CalendarEventTopic} from '../../model/calendar-event-topic';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-calendar-event-topic-list',
  templateUrl: './calendar-event-topic-list.page.html',
  styleUrls: ['./calendar-event-topic-list.page.scss'],
})
export class CalendarEventTopicListPage implements OnInit {

  eventId: string;
  planId: string;
  calendarPlan: Observable<CalendarPlan>;
  calendarEvent: CalendarPlanEvent;
  calendarEventTopics: Observable<CalendarEventTopic[]>;

  seasonInfo = SEASON_INFO;
  audienceInfo = AUDIENCE_INFO;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');
    this.eventId = this.route.snapshot.paramMap.get('eventId');

    this.calendarPlan = afs.doc<CalendarPlan>(`calendarPlan/${this.planId}`).valueChanges();
    afs.doc<CalendarPlanEvent>(`events/${this.eventId}`).valueChanges().pipe(take(1)).subscribe(data => {
      this.calendarEvent = data;
    });

    this.calendarEventTopics = afs.collection(`topics`,
      q => q.where('eventId', '==', this.eventId).where('planId', '==', this.planId).orderBy('sequence', 'asc')
    ).snapshotChanges(['added', 'removed']).pipe(callback);
  }

  ngOnInit() {

  }

}
