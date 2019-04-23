import { Injectable } from '@angular/core';
import * as datefns from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class MoveableFeastService {

  BAPTISM_OF_THE_LORD_DAY: number = 6;
  BAPTISM_OF_THE_LORD_MONTH: number = 0;
  CHRISTMAS_FIRST_DAY: number = 25;
  CHRISTMAS_MONTH: number = 11;

  constructor(private easterDate: Date) { }

  pentecost(): Date {
    let ascensionDay = datefns.addDays(this.easterDate, 40);

    ascensionDay = datefns.isSunday(ascensionDay) ?
      ascensionDay :
      datefns.lastDayOfWeek(
        ascensionDay, {
          weekStartsOn: 1
        });

    return datefns.addWeeks(ascensionDay, 1);
  }

  holyThursday(): Date {
    return datefns.subDays(this.easterDate, 3);
  }

  goodFriday(): Date {
    return datefns.subDays(this.easterDate, 2);
  }

  holySaturday(): Date {
    return datefns.subDays(this.easterDate, 1);
  }

  ashWednesday(): Date {
    return datefns.subDays(this.easterDate, 46);
  }

  baptismOftheLord(): Date {
    return new Date(
      datefns.getYear(this.easterDate),
      this.BAPTISM_OF_THE_LORD_MONTH,
      this.BAPTISM_OF_THE_LORD_DAY);
  }

  christmas() {
    return new Date(
      datefns.getYear(datefns.subYears(this.easterDate, 1)),
      this.CHRISTMAS_MONTH,
      this.CHRISTMAS_FIRST_DAY);
  }

  lastDayOfChristmastide(): Date {
    const baptismOftheLord = this.baptismOftheLord();

    return datefns.isSunday(baptismOftheLord) ?
      datefns.addWeeks(baptismOftheLord, 1) :
      datefns.lastDayOfWeek(
        baptismOftheLord, {
          weekStartsOn: 1
        });
  }

  // The first sunday of advent is the fourth sunday before christmas
  firstSundayOfAdvent(): Date {
    const lastDayOfAdvent = this.lastDayOfAdvent();

    if (datefns.isSunday(lastDayOfAdvent)) {
      return datefns.subWeeks(lastDayOfAdvent, 3);
    }

    let firstSundayBeforeChristmas = datefns.startOfWeek(
      lastDayOfAdvent, {
        weekStartsOn: 0
      });

    return datefns.subWeeks(firstSundayBeforeChristmas, 3);
  }

  lastDayOfAdvent(): Date {
    return datefns.subDays(this.christmas(), 1);
  }
}
