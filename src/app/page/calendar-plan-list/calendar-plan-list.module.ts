import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CalendarPlanListPage} from './calendar-plan-list.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarPlanListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CalendarPlanListPage]
})
export class CalendarPlanListPageModule {
}
