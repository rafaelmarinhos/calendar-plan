export const PERIOD_TYPE_INFO = {
  liturgical: { name: 'Litúrgico', symbol: '&#9651;', type: 'liturgical' },
  catechetical: { name: 'Catequético', symbol: '&#9671;', type: 'catechetical' },
  civil: { name: 'Civil', symbol: '&#9678;', type: 'civil' }
};

export const LITURGICAL_PERIODS = {
  advent: { name: 'Tempo do Advento', periodType: PERIOD_TYPE_INFO.liturgical },
  christmastide: { name: 'Tempo do Natal', periodType: PERIOD_TYPE_INFO.liturgical },
  firstOrdinaryTime: { name: 'Tempo Comum (I)', periodType: PERIOD_TYPE_INFO.liturgical },
  lent: { name: 'Quaresma', periodType: PERIOD_TYPE_INFO.liturgical },
  easterTriduum: { name: 'Tríduo Pascal', periodType: PERIOD_TYPE_INFO.liturgical },
  eastertide: { name: 'Páscoa', periodType: PERIOD_TYPE_INFO.liturgical },
  secondOrdinaryTime: { name: 'Tempo Comum (II)', periodType: PERIOD_TYPE_INFO.liturgical }
};

export const CATECHETICAL_PERIODS = {
  purificationAndIllumination: { name: 'Purificação e Iluminação', periodType: PERIOD_TYPE_INFO.catechetical },
  examination: { name: 'Examinação', periodType: PERIOD_TYPE_INFO.catechetical },
  catechumenate: { name: 'Catecumenato', periodType: PERIOD_TYPE_INFO.catechetical }
};

export interface CalendarPeriod {
  id?: string;
  originalId?: string;
  name?: string;
  periodType?: string;
  planId?: string;
  originalPlanId?: string;
  startDate?: Date,
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
