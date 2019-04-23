import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CalendarEventListPage} from './calendar-event-list.page';
import {PipesModule} from '../../pipe/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: CalendarEventListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule
  ],
  declarations: [CalendarEventListPage]
})
export class CalendarEventListPageModule {
}
