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

  today = new Date();
  horizontalCalendarDates: any;
  HOZ_CAL: any;
  randomIndex = 1000;
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

    this.randomIndex > 999
      ? this.randomIndex = 0
      : this.randomIndex++;

    // console.log('daysfjaisojsd: ', this.HOZ_CAL);
    console.log('daysfjaisojsd: ', this.randomIndex);
  }

  liturgia = [
    {
      primeira: `(At 4,1-12)
        Leitura dos Atos dos Apóstolos.
        Naqueles dias, depois que o paralítico fora curado, 1Pedro e João ainda estavam falando ao povo, quando chegaram os sacerdotes, o chefe da guarda do Templo e os saduceus. 2Estavam irritados porque os apóstolos ensinavam o povo e anunciavam a ressurreição dos mortos na pessoa de Jesus.
        3Eles prenderam Pedro e João e os colocaram na prisão até o dia seguinte, porque já estava anoitecendo. 4Todavia, muitos daqueles que tinham ouvido a pregação acreditaram. E o número dos homens chegou a uns cinco mil.
        5No dia seguinte, reuniram-se em Jerusalém os chefes, os anciãos e os mestres da Lei. 6Estavam presentes o Sumo Sacerdote Anás, e também Caifás, João, Alexandre, e todos os que pertenciam às famílias dos sumos sacerdotes. 7Fizeram Pedro e João comparecer diante deles e os interrogavam: “Com que poder ou em nome de quem vós fizestes isso?” 8Então, Pedro, cheio do Espírito Santo, disse-lhes: “Chefes do povo e anciãos: 9hoje estamos sendo interrogados por termos feito o bem a um enfermo e pelo modo como foi curado. 10Ficai, pois, sabendo todos vós e todo o povo de Israel: é pelo nome de Jesus Cristo, de Nazaré, — aquele que vós crucificastes e que Deus ressuscitou dos mortos — que este homem está curado, diante de vós. 11Jesus é a pedra, que vós, os construtores, desprezastes, e que se tornou a pedra angular.
        12Em nenhum outro há salvação, pois não existe debaixo do céu outro nome dado aos homens pelo qual possamos ser salvos”.
        - Palavra do Senhor.
        - Graças a Deus.`,
      salmo: `(Sl 117,1-27a)
        — A pedra que os pedreiros rejeitaram, tornou-se agora a pedra angular.
        — A pedra que os pedreiros rejeitaram, tornou-se agora a pedra angular.
        — Dai graças ao Senhor, porque ele é bom! “Eterna é a sua misericórdia!” A casa de Israel agora o diga: “Eterna é a sua misericórdia!” Os que temem o Senhor agora o digam: “Eterna é a sua misericórdia!”
        — “A pedra que os pedreiros rejeitaram, tornou-se agora a pedra angular. Pelo Senhor é que foi feito tudo isso: Que maravilhas ele fez a nossos olhos! Este é o dia que o Senhor fez para nós, alegremo-nos e nele exultemos!
        — Ó Senhor, dai-nos a vossa salvação, ó Senhor, dai-nos também prosperidade!” Bendito seja, em nome do Senhor, aquele que em seus átrios vai entrando! Desta casa do Senhor vos bendizemos. Que o Senhor e nosso Deus nos ilumine!
        `,
      evangelho: `(Jo 21,1-14)
        — O Senhor esteja convosco.
        — Ele está no meio de nós.
        — Proclamação do Evangelho de Jesus Cristo + segundo João.
        — Glória a vós, Senhor.
        Naquele tempo, 1Jesus apareceu de novo aos discípulos, à beira do mar de Tiberíades. A aparição foi assim: 2Estavam juntos Simão Pedro, Tomé, chamado Dídimo, Natanael de Caná da Galileia, os filhos de Zebedeu e outros dois discípulos de Jesus.
        3Simão Pedro disse a eles: “Eu vou pescar”. Eles disseram: “Também vamos contigo”. Saíram e entraram na barca, mas não pescaram nada naquela noite. 4Já tinha amanhecido, e Jesus estava de pé na margem. Mas os discípulos não sabiam que era Jesus. 5Então Jesus disse: “Moços, tendes alguma coisa para comer?” Responderam: “Não”.
        6Jesus disse-lhes: “Lançai a rede à direita da barca, e achareis”. Lançaram pois a rede e não conseguiam puxá-la para fora, por causa da quantidade de peixes. 7Então, o discípulo a quem Jesus amava disse a Pedro: “É o Senhor!” Simão Pedro, ouvindo dizer que era o Senhor, vestiu sua roupa, pois estava nu, e atirou-se ao mar. 8Os outros discípulos vieram com a barca, arrastando a rede com os peixes. Na verdade, não estavam longe da terra, mas somente a cerca de cem metros. 9Logo que pisaram a terra, viram brasas acesas, com peixe em cima, e pão. 10Jesus disse-lhes: “Trazei alguns dos peixes que apanhastes”.
        11Então Simão Pedro subiu ao barco e arrastou a rede para a terra. Estava cheia de cento e cinquenta e três grandes peixes; e, apesar de tantos peixes, a rede não se rompeu. 12Jesus disse-lhes: “Vinde comer”. Nenhum dos discípulos se atrevia a perguntar quem era ele, pois sabiam que era o Senhor. 13Jesus aproximou-se, tomou o pão e distribuiu-o por eles. E fez a mesma coisa com o peixe. 14Esta foi a terceira vez que Jesus, ressuscitado dos mortos, apareceu aos discípulos.
        — Palavra da Salvação.
        — Glória a vós, Senhor.`
    },
    {
      primeira: ` (At 3,11-26)
        Leitura dos Atos dos Apóstolos.
        Naqueles dias, 11como o paralítico não deixava mais Pedro e João, todo o povo, assombrado, foi correndo para junto deles, no chamado “Pórtico de Salomão”.
        12Ao ver isso, Pedro dirigiu-se ao povo: “Israelitas, por que vos espantais com o que aconteceu? Por que ficais olhando para nós, como se tivéssemos feito este homem andar com nosso próprio poder ou piedade? 13O Deus de Abraão, de Isaac, de Jacó, o Deus de nossos antepassados glorificou o seu servo Jesus. Vós o entregastes e o rejeitastes diante de Pilatos, que estava decidido a soltá-lo.
        14Vós rejeitastes o Santo e o Justo, e pedistes a libertação para um assassino. 15Vós matastes o autor da vida, mas Deus o ressuscitou dos mortos, e disso nós somos testemunhas. 16Graças à fé no nome de Jesus, este Nome acaba de fortalecer este homem que vedes e reconheceis. A fé que vem por meio de Jesus lhe deu perfeita saúde na presença de todos vós.
        17E agora, meus irmãos, eu sei que vós agistes por ignorância, assim como vossos chefes. 18Deus, porém, cumpriu desse modo o que havia anunciado pela boca de todos os profetas: que o seu Cristo haveria de sofrer. 19Arrependei-vos, portanto, e convertei-vos, para que vossos pecados sejam perdoados. 20Assim podereis alcançar o tempo do repouso que vem do Senhor. E ele enviará Jesus, o Cristo, que vos foi destinado.
        21No entanto, é necessário que o céu o receba, até que se cumpra o tempo da restauração de todas as coisas, conforme disse Deus, nos tempos passados, pela boca de seus santos profetas. 22Com efeito, Moisés afirmou: ‘O Senhor Deus fará surgir, entre vossos irmãos, um profeta como eu. Escutai tudo o que ele vos disser. 23Quem não der ouvidos a esse profeta, será eliminado do meio do povo’.
        24E todos os profetas que falaram, desde Samuel e seus sucessores, também eles anunciaram estes dias. 25Vós sois filhos dos profetas e da aliança, que Deus fez com vossos pais, quando disse a Abraão: ‘Através da tua descendência serão abençoadas todas as famílias da terra’. 26Após ter ressuscitado o seu servo, Deus o enviou em primeiro lugar a vós, para vos abençoar, na medida em que cada um se converta de suas maldades”.
        - Palavra do Senhor.
        - Graças a Deus.
        `,
      salmo: ` (Sl 8)
        — Ó Senhor, nosso Deus, como é grande vosso nome por todo o universo!
        — Ó Senhor, nosso Deus, como é grande vosso nome por todo o universo!
        — Ó Senhor, nosso Deus, como é grande vosso nome por todo o universo! Perguntamos: “Senhor, que é o homem para dele assim vos lembrardes e o tratardes com tanto carinho?”
        — Pouco abaixo de Deus o fizestes, coroando-o de glória e esplendor; vós lhe destes poder sobre tudo, vossas obras aos pés lhe pusestes.
        — As ovelhas, os bois, os rebanhos, todo o gado e as feras da mata; passarinhos e peixes dos mares, todo ser que se move nas águas.
        `,
      evangelho: ` (Lc 24,35-48)
        — O Senhor esteja convosco.
        — Ele está no meio de nós.
        — Proclamação do Evangelho de Jesus Cristo + segundo Lucas.
        — Glória a vós, Senhor.
        Naquele tempo, 35os discípulos contaram o que tinha acontecido no caminho, e como tinham reconhecido Jesus ao partir o pão. 36Ainda estavam falando, quando o próprio Jesus apareceu no meio deles e lhes disse: “A paz esteja convosco!”
        37Eles ficaram assustados e cheios de medo, pensando que estavam vendo um fantasma. 38Mas Jesus disse: “Por que estais preocupados, e por que tendes dúvidas no coração? 39Vede minhas mãos e meus pés: sou eu mesmo! Tocai em mim e vede! Um fantasma não tem carne, nem ossos, como estais vendo que eu tenho”.
        40E dizendo isso, Jesus mostrou-lhes as mãos e os pés. 41Mas eles ainda não podiam acreditar, porque estavam muito alegres e surpresos. Então Jesus disse: “Tendes aqui algumacoisa para comer?” 42Deram-lhe um pedaço de peixe assado. 43Ele o tomou e comeu diante deles. 44Depois disse-lhes: “São estas as coisas que vos falei quando ainda estava convosco: era preciso que se cumprisse tudo o que está escrito sobre mim na Lei de Moisés, nos Profetas e nos Salmos”.
        45Então Jesus abriu a inteligência dos discípulos para entenderem as Escrituras, 46e lhes disse: “Assim está escrito: o Cristo sofrerá e ressuscitará dos mortos ao terceiro dia 47e no seu nome, serão anunciados a conversão e o perdão dos pecados a todas as nações, começando por Jerusalém. 48Vós sereis testemunhas de tudo isso”.
        — Palavra da Salvação.
        — Glória a vós, Senhor.`
    },
    {
      primeira: ` (At 4,13-21)
        Leitura dos Atos dos Apóstolos.
        Naqueles dias, os chefes dos sacerdotes, os anciãos e os escribas 13ficaram admirados ao ver a segurança com que Pedro e João falavam, pois eram pessoas simples e sem instrução. Reconheciam que eles tinham estado com Jesus. 14No entanto viam, de pé, junto a eles, o homem que tinha sido curado. E não podiam dizer nada em contrário.
        15Mandaram que saíssem para fora do Sinédrio, e começaram a discutir entre si: 16“Que vamos fazer com esses homens? Eles realizaram um milagre claríssimo, e o fato tornou-se de tal modo conhecido por todos os habitantes de Jerusalém, que não podemos negá-lo. 17Contudo, a fim de que a coisa não se espalhe ainda mais entre o povo, vamos ameaçá-los, para que não falem mais a ninguém a respeito do nome de Jesus”. 18Chamaram de novo Pedro e João e ordenaram-lhes que, de modo algum, falassem ou ensinassem em nome de Jesus. 19Pedro e João responderam: “Julgai vós mesmos, se é justo diante de Deus que obedeçamos a vós e não a Deus! 20Quanto a nós, não nos podemos calar sobre o que vimos e ouvimos”. 21Então, insistindo em suas ameaças, deixaram Pedro e João em liberdade, já que não tinham meio de castigá-los, por causa do povo. Pois todos glorificavam a Deus pelo que havia acontecido.
        - Palavra do Senhor.
        - Graças a Deus.`,
      salmo: `(Sl 117,1-21)
        — Dou-vos graças, ó Senhor, porque me ouvistes.
        — Dou-vos graças, ó Senhor, porque me ouvistes.
        — Dai graças ao Senhor, porque ele é bom! “Eterna é a sua misericórdia!” O Senhor é minha força e o meu canto, e tornou-se para mim o Salvador. “Clamores de alegria e de vitória ressoem pelas tendas dos fiéis.
        — A mão direita do Senhor fez maravilhas, a mão direita do Senhor me levantou, a mão direita do Senhor fez maravilhas!” O Senhor severamente me provou, mas não me abandonou às mãos da morte.
        — Abri-me vós, abri-me as portas da justiça; quero entrar para dar graças ao Senhor! “Sim, esta é a porta do Senhor, por ela só os justos entrarão!” Dou-vos graças, ó Senhor, porque me ouvistes e vos tornastes para mim o Salvador!
        `,
      evangelho: ` (Mc 16,9-15)
        — O Senhor esteja convosco.
        — Ele está no meio de nós.
        — Proclamação do Evangelho de Jesus Cristo + segundo Marcos.
        — Glória a vós, Senhor.
        9Depois de ressuscitar, na madrugada do primeiro dia após o sábado, Jesus apareceu primeiro a Maria Madalena, da qual havia expulsado sete demônios. 10Ela foi anunciar isso aos seguidores de Jesus, que estavam de luto e chorando.11Quando ouviram que ele estava vivo e fora visto por ela, não quiseram acreditar. 12Em seguida, Jesus apareceu a dois deles, com outra aparência, enquanto estavam indo para o campo. 13Eles também voltaram e anunciaram isso aos outros. Também a estes não deram crédito. 14Por fim, Jesus apareceu aos onze discípulos enquanto estavam comendo, repreendeu-os por causa da falta de fé e pela dureza de coração, porque não tinham acreditado naqueles que o tinham visto ressuscitado. 15E disse-lhes: “Ide pelo mundo inteiro e anunciai o Evangelho a toda criatura!”
        — Palavra da Salvação.
        — Glória a vós, Senhor.`
    },
  ]
}

