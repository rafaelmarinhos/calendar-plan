export const SEASON_INFO = {
  evangelization: { name: 'Pré-catecumenato ou Evangelização', symbol: '&#9651;' },
  catechism: { name: 'Catecumenato ou Catequese', symbol: '&#9671;' },
  purification: { name: 'Purificação ou Iluminação', symbol: '&#9678;' },
  mystagogy: { name: 'Mistagogia', symbol: '&#9678;' }
};

export const AUDIENCE_INFO = {
  all: { name: 'Todos', symbol: '&#9651;' },
  child: { name: 'Crianças', symbol: '&#9651;' },
  teenager: { name: 'Adolescentes', symbol: '&#9671;' },
  young: { name: 'Jovens', symbol: '&#9678;' },
  adult: { name: 'Adultos', symbol: '&#9678;' }
};

export interface CalendarPlanEvent {
  id?: string;
  originalId?: string;
  planId?: string;
  originalPlanId?: string;
  audience?: string;
  season?: string;
  name?: string;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
