import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {BranchEditPage} from './branch-edit.page';
import {DirectivesModule} from '../../directive/directives.module';
import {ComponentsModule} from '../../component/components.module';
import {MAT_DATE_LOCALE, MatDatepickerModule, MatNativeDateModule} from '@angular/material';
import {CalendarPlanSelectPage} from '../calendar-plan-select/calendar-plan-select.page';

const routes: Routes = [
  {
    path: '',
    component: BranchEditPage
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
  declarations: [
    BranchEditPage,
    CalendarPlanSelectPage
  ],
  entryComponents: [
    CalendarPlanSelectPage
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
  ]
})
export class BranchEditPageModule {
}
