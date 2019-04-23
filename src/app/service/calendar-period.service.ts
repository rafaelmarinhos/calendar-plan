import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CalendarPeriod } from '../model/calendar-period';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CalendarPeriodService {

  constructor(private afs: AngularFirestore) { }

  create(planId: string, name: string, periodType: string, startsAt: Date, endsAt: Date) {
    const ref = this.afs.collection<CalendarPeriod>(`periods`);
    ref.add({
      name: name,
      periodType: periodType,
      planId: planId,
      startDate: startsAt,
      startsAt: moment(startsAt).format('DD/MM/YYYY'),
      endsAt: moment(endsAt).format('DD/MM/YYYY'),
      createdAt: moment().format('DD/MM/YYYY HH:mm'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm')
    });
  }
}
