import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {CalendarEventTopic} from '../../model/calendar-event-topic';
import {AUDIENCE_INFO, CalendarPlanEvent, SEASON_INFO} from '../../model/calendar-plan-event';
import {ToastController} from '@ionic/angular';

export const callback = map((items: any) => items.map(a => {
  const data = a.payload.doc.data() as CalendarEventTopic;
  const id = a.payload.doc.id;
  return {id, ...data};
}));

@Component({
  selector: 'app-calendar-event-topic-reorder',
  templateUrl: './calendar-event-topic-reorder.page.html',
  styleUrls: ['./calendar-event-topic-reorder.page.scss'],
})
export class CalendarEventTopicReorderPage implements OnInit, OnDestroy {

  planId: string;
  calendarEvents: any[];
  calendarEventsSubscription: Subscription;

  seasonInfo = SEASON_INFO;
  audienceInfo = AUDIENCE_INFO;

  seasonId: string;
  audienceId: string;

  constructor(
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) {
    this.planId = this.route.snapshot.paramMap.get('planId');

    setTimeout(_ => {
      this.seasonId = Object.keys(SEASON_INFO)[1];
      this.audienceId = Object.keys(AUDIENCE_INFO)[0];

      this.filter();
    }, 100);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.calendarEventsSubscription.unsubscribe();
  }

  filter() {
    this.calendarEventsSubscription = this.afs.collection(`events`,
      q => q.where('planId', '==', this.planId)
        .where('season', '==', this.seasonId)
        .where('audience', '==', this.audienceId)
    ).snapshotChanges(['added', 'removed']).pipe(
      map((items: any) => items.map(a => {
        const data = a.payload.doc.data() as CalendarPlanEvent;
        const id = a.payload.doc.id;
        const topics = this.afs.collection('topics',
          q => q.where('eventId', '==', id).where('planId', '==', this.planId).orderBy('sequence', 'asc')
        ).snapshotChanges().pipe(callback);
        return {id, ...data, topics: topics};
      }))
    ).subscribe(list => {
      this.calendarEvents = list;
    });
  }

  dragOver(e) {
    e.preventDefault();
    e.target.style.backgroundColor = '#f0f0f0';
  }

  dragLeave(e) {
    e.preventDefault();
    e.target.style.backgroundColor = 'white';
  }

  drag(e) {
    // console.log(e.target.id);
    e.dataTransfer.setData('text', e.target.id);
  }

  drop(e) {
    e.preventDefault();
    e.target.style.backgroundColor = 'white';
    const topicId = e.dataTransfer.getData('text');
    this.afs.doc(`topics/${topicId}`).update({eventId: e.target.id});
  }

  moveItem(e, increment) {
    const item = e.target.closest('ion-item');
    const container = e.target.closest('ion-list');

    const list = [].slice.call(e.target.closest('ion-list').children);
    const currentIndex = list.indexOf(item);

    if (currentIndex === 0 && increment < 0) {
      return false;
    } else if (currentIndex === list.length - 1 && increment > 0) {
      return false;
    }

    this.arrayMove(list, currentIndex, currentIndex + increment);
    list.forEach(i => {
      container.append(i);
    });
  }

  arrayMove(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }

  save() {
    const batch = this.afs.firestore.batch();
    const lists = [].slice.call(document.getElementsByClassName('topic-list'));
    lists.forEach(list => {
      const items = [].slice.call(list.children).map(item => item.getAttribute('id'));
      items.forEach((id, index) => {
        batch.update(this.afs.firestore.doc(`topics/${id}`), {sequence: index});
      });
    });
    batch.commit().then(async _ => {
      const toast = await this.toastCtrl.create({message: 'Tópicos atualizados', duration: 3000});
      toast.present();
    }, error => {
      console.log(error);
    });
  }
}
