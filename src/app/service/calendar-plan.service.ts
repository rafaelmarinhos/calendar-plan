import { Injectable } from '@angular/core';
import * as datefns from 'date-fns';
import { GOLDEN_NUMBER_DATE } from 'src/app/model/golden-number-date';
import { LITURGICAL_PERIODS, CATECHETICAL_PERIODS } from 'src/app/model/calendar-period';
import { CalendarPeriodService } from './calendar-period.service';
import { MoveableFeastService } from './moveable-feast.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarPlanService {

  private moveableFeastService: MoveableFeastService;
  private planId: string;
  private easterDate: Date;

  constructor(private periodService: CalendarPeriodService) { }

  getEasterDate(yearRef: number): Date {
    const dateGoldenNumber = this.getDateFromGoldenNumber(yearRef);

    // gets the next sunday after the golden number date
    return datefns.isSunday(dateGoldenNumber) ?
      datefns.addWeeks(dateGoldenNumber, 1) :
      datefns.lastDayOfWeek(dateGoldenNumber, { weekStartsOn: 1 });
  }

  getDateFromGoldenNumber(yearRef: number): Date {
    const goldenNumber = this.getGoldenNumber(yearRef);

    return new Date(
      yearRef,
      GOLDEN_NUMBER_DATE[goldenNumber].month,
      GOLDEN_NUMBER_DATE[goldenNumber].day);
  }

  getGoldenNumber(yearRef: number): number {
    const divider = 19;
    const remainder = yearRef % divider;
    return remainder + 1;
  }

  createPeriods(planId: string, easterDate: Date, params: Object) {
    this.moveableFeastService = new MoveableFeastService(easterDate);
    this.planId = planId;
    this.easterDate = easterDate;

    this.createLiturgicalCalendar();
    this.createCatecheticalCalendar(params);
  }

  createLiturgicalCalendar() {

    // Advent (Tempo do Advento)
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.advent.name,
      LITURGICAL_PERIODS.advent.periodType.type,
      this.moveableFeastService.firstSundayOfAdvent(),
      this.moveableFeastService.lastDayOfAdvent()
    );

    // Christmastide (Tempo do Natal)
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.christmastide.name,
      LITURGICAL_PERIODS.christmastide.periodType.type,
      this.moveableFeastService.christmas(),
      this.moveableFeastService.lastDayOfChristmastide()
    );

    // First Ordinary Time (Tempo Comum (I))
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.firstOrdinaryTime.name,
      LITURGICAL_PERIODS.firstOrdinaryTime.periodType.type,
      datefns.addDays(this.moveableFeastService.lastDayOfChristmastide(), 1),
      datefns.subDays(this.moveableFeastService.ashWednesday(), 1),
    );

    // Lent (Quaresma)
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.lent.name,
      LITURGICAL_PERIODS.lent.periodType.type,
      this.moveableFeastService.ashWednesday(),
      datefns.subDays(this.moveableFeastService.holyThursday(), 1),
    );

    // Easter Triduum (Tríduo Pascal)
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.easterTriduum.name,
      LITURGICAL_PERIODS.easterTriduum.periodType.type,
      this.moveableFeastService.holyThursday(),
      this.moveableFeastService.holySaturday()
    );

    // Eastertide (Páscoa)
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.eastertide.name,
      LITURGICAL_PERIODS.eastertide.periodType.type,
      this.easterDate,
      this.moveableFeastService.pentecost()
    );

    // Second Ordinary Time (Tempo Comum (II))
    this.periodService.create(
      this.planId,
      LITURGICAL_PERIODS.secondOrdinaryTime.name,
      LITURGICAL_PERIODS.secondOrdinaryTime.periodType.type,
      datefns.addDays(this.moveableFeastService.pentecost(), 1),
      datefns.subDays(this.moveableFeastService.firstSundayOfAdvent(), 1)
    );
  }

  createCatecheticalCalendar(params: object) {

    const examination = params['examination'];

    // Purification e Illumination (Purificação e Iluminação)
    // Same period of lent from liturgical calendar
    this.periodService.create(
      this.planId,
      CATECHETICAL_PERIODS.purificationAndIllumination.name,
      CATECHETICAL_PERIODS.purificationAndIllumination.periodType.type,
      this.moveableFeastService.ashWednesday(),
      datefns.subDays(this.moveableFeastService.holyThursday(), 1)
    );

    // Examination (Examinação)
    this.periodService.create(
      this.planId,
      CATECHETICAL_PERIODS.examination.name,
      CATECHETICAL_PERIODS.examination.periodType.type,
      datefns.subWeeks(this.moveableFeastService.ashWednesday(), examination),
      datefns.subDays(this.moveableFeastService.ashWednesday(), 1)
    );

    // Catechumenate
    this.periodService.create(
      this.planId,
      CATECHETICAL_PERIODS.catechumenate.name,
      CATECHETICAL_PERIODS.catechumenate.periodType.type,
      datefns.subWeeks(this.moveableFeastService.ashWednesday(), 96),
      datefns.subDays(this.moveableFeastService.ashWednesday(), 1)
    );
  }
}
