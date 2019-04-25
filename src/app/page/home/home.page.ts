import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarView, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarEvent } from 'angular-calendar';
import { Subject, Subscription } from 'rxjs';
import { startOfDay, endOfDay, isSameDay, isSameMonth, isWithinRange } from 'date-fns';
import { environment } from '../../../environments/environment';
import { map, switchMap, take } from 'rxjs/operators';
import { CalendarPlan } from '../../model/calendar-plan';
import { AngularFirestore } from '@angular/fire/firestore';
import { CalendarPeriod, PERIOD_TYPE_INFO } from '../../model/calendar-period';
import * as moment from 'moment';
import { AuthService } from '../../service/auth.service';
import { CalendarPlanEvent } from '../../model/calendar-plan-event';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage implements OnInit, OnDestroy {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[];
  activeDayIsOpen = false;
  refresh: Subject<any> = new Subject();

  calendarPlanSubscription: Subscription;
  calendarPlans: CalendarPlan[];
  selectedCalendarPlanId: string;
  calendarPlanId = new Subject<string>();
  calendarPeriods: CalendarPeriod[];
  calendarPeriodLegends: any[];
  locale = 'pt';

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    const periodsQueryObservable = this.calendarPlanId.pipe(
      switchMap(id =>
        afs.collection(`periods`, q => q.where('planId', '==', id)).valueChanges()
      )
    );
    periodsQueryObservable.subscribe(calendarPeriods => {
      this.calendarPeriods = calendarPeriods;
      const calendarPeriodLabels = [];
      this.calendarPeriodLegends = [];
      this.calendarPeriods.forEach(item => {
        if (!calendarPeriodLabels.includes(item.periodType)) {
          this.calendarPeriodLegends.push({
            type: item.periodType,
            name: PERIOD_TYPE_INFO[item.periodType].name,
            symbol: PERIOD_TYPE_INFO[item.periodType].symbol
          });
          calendarPeriodLabels.push(item.periodType);
        }
      });
      this.refresh.next();
    });

    const eventsQueryObservable = this.calendarPlanId.pipe(
      switchMap(planId =>
        afs.collection(`events`, q => q.where('planId', '==', planId)).snapshotChanges().pipe(
          map((items: any) => items.map(a => {
            const data = a.payload.doc.data() as CalendarPlanEvent;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        )
      )
    );
    eventsQueryObservable.subscribe(events => {
      this.events = events.map((item: any) => {
        const startsAt = moment(item.startsAt, 'DD/MM/YYYY').toDate();
        return {
          start: startsAt,
          end: item.endsAt ? moment(item.endsAt, 'DD/MM/YYYY').toDate() : startsAt,
          title: item.name,
          color: environment.colors.blue,
          url: `/calendarEvent/edit/${this.selectedCalendarPlanId}/${item.id}`
        };
      });
      if (!this.events) {
        this.events = [];
      }
      this.refresh.next();
    });

    this.calendarPlanSubscription = afs.collection('calendarPlan',
      q => q.where('permissions', 'array-contains', { email: this.authService.getAuthInfo().email, role: 'manager' })
    ).snapshotChanges(['added', 'removed']).pipe(
      map((items, index) => items.map(a => {
        const data = a.payload.doc.data() as CalendarPlan;
        const id = a.payload.doc.id;
        if (index === 0) {
          setTimeout(_ => {
            this.selectedCalendarPlanId = id;
            this.calendarPlanId.next(id);
          }, 100);
        }
        return { id, ...data };
      }))
    ).subscribe(list => this.calendarPlans = list);
  }

  ngOnInit() {
    this.setCalendarDates(new Date());
  }

  ngOnDestroy() {
    this.calendarPlanSubscription.unsubscribe();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: any): void {
    this.router.navigate([event.url]);
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    if (this.calendarPeriods) {
      body.forEach(day => {
        day['periodTypes'] = [];
        this.calendarPeriods.forEach(period => {
          const startsAt = moment(period.startsAt, 'DD/MM/YYYY').toDate();
          const endsAt = moment(period.endsAt, 'DD/MM/YYYY').toDate();
          if (isWithinRange(day.date, startsAt, endsAt)) {
            day['periodTypes'].push({ symbol: PERIOD_TYPE_INFO[period.periodType].symbol, name: period.name });
            day.cssClass = 'cal-day-selected';
          }
        });

      });
    }
  }

  updateSelectedCalendarPlan() {
    this.calendarPlanId.next(this.selectedCalendarPlanId);
  }

  // Funções calendário horizontal

  horizontalCalendarDates: any;
  HOZ_CAL: any;
  weekDays = [
    {
      full: 'Domingo',
      short: 'Dom'
    },
    {
      full: 'Segunda',
      short: 'Seg'
    },
    {
      full: 'Terça',
      short: 'Ter'
    },
    {
      full: 'Quarta',
      short: 'Qua'
    },
    {
      full: 'Quinta',
      short: 'Qui'
    },
    {
      full: 'Sexta',
      short: 'Sex'
    },
    {
      full: 'Sábado',
      short: 'Sab'
    },
  ];
  monthNames = [
    {
      full: 'Janeiro',
      short: 'Jan'
    },
    {
      full: 'Fevereiro',
      short: 'Fev'
    },
    {
      full: 'Março',
      short: 'Mar'
    },
    {
      full: 'Abril',
      short: 'Abr'
    },
    {
      full: 'Maio',
      short: 'Mai'
    },
    {
      full: 'Junho',
      short: 'Jun'
    },
    {
      full: 'Julho',
      short: 'Jul'
    },
    {
      full: 'Agosto',
      short: 'Ago'
    },
    {
      full: 'Setembro',
      short: 'Set'
    },
    {
      full: 'Outubro',
      short: 'Out'
    },
    {
      full: 'Novembro',
      short: 'Nov'
    },
    {
      full: 'Dezembro',
      short: 'Dez'
    },
  ];

  setCalendarDates(baseDate = new Date()) {
    this.horizontalCalendarDates = [];
    const numberOfDates = 7;
    const daysFromToday = -3;

    for (let i = daysFromToday; i < daysFromToday + numberOfDates; i++) {
      const dateOffset = (24*60*60*1000) * i;
      let bufferDate = new Date(baseDate);
      const day = new Date(bufferDate.setTime(bufferDate.getTime() + dateOffset));
      this.horizontalCalendarDates.push({
        date: day,
        day: day.getDate(),
        month: day.getMonth(),
        monthNameShort: this.monthNames[day.getMonth()].short,
        monthNameFull: this.monthNames[day.getMonth()].full,
        year: day.getFullYear(),
        weekDayShort: this.weekDays[day.getDay()].short,
        weekDayFull: this.weekDays[day.getDay()].full,
      });
    }

    this.HOZ_CAL = this.horizontalCalendarDates;

    console.log('daysfjaisojsd: ', this.HOZ_CAL);
  }
}
