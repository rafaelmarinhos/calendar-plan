import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CalendarPeriodListPage} from './calendar-period-list.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarPeriodListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    CalendarPeriodListPage,
  ]
})
export class CalendarPeriodListPageModule {
}
