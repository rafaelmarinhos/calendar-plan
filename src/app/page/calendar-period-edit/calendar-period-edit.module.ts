import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {CalendarPeriodEditPage} from './calendar-period-edit.page';
import {DirectivesModule} from '../../directive/directives.module';
import {ComponentsModule} from '../../component/components.module';
import {MAT_DATE_LOCALE, MatDatepickerModule, MatNativeDateModule} from '@angular/material';

const routes: Routes = [
  {
    path: '',
    component: CalendarPeriodEditPage
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
  ],
  declarations: [CalendarPeriodEditPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
  ]
})
export class CalendarPeriodEditPageModule {
}
