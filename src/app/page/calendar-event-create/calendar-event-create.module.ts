import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CalendarEventCreatePage} from './calendar-event-create.page';
import {PipesModule} from '../../pipe/pipes.module';
import {MAT_DATE_LOCALE, MatDatepickerModule, MatNativeDateModule} from '@angular/material';
import {DirectivesModule} from '../../directive/directives.module';
import {ComponentsModule} from '../../component/components.module';

const routes: Routes = [
  {
    path: '',
    component: CalendarEventCreatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    DirectivesModule,
    ComponentsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PipesModule
  ],
  declarations: [CalendarEventCreatePage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
  ]
})
export class CalendarEventCreatePageModule {
}
