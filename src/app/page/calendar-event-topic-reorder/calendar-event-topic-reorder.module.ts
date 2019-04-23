import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CalendarEventTopicReorderPage} from './calendar-event-topic-reorder.page';
import {PipesModule} from '../../pipe/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: CalendarEventTopicReorderPage
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
  declarations: [CalendarEventTopicReorderPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class CalendarEventTopicReorderPageModule {
}
