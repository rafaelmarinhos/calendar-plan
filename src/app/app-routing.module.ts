import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './service/auth-guard.service';

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'login', loadChildren: './page/login/login.module#LoginPageModule'},
  {path: 'signup', loadChildren: './page/signup/signup.module#SignupPageModule'},
  {path: 'home', loadChildren: './page/home/home.module#HomePageModule', canActivate: [AuthGuard]},
  {path: 'calendarPlan/create', loadChildren: './page/calendar-plan-create/calendar-plan-create.module#CalendarPlanCreatePageModule', canActivate: [AuthGuard]},
  {path: 'calendarPlan/list', loadChildren: './page/calendar-plan-list/calendar-plan-list.module#CalendarPlanListPageModule', canActivate: [AuthGuard]},
  {path: 'calendarPlan/edit/:id', loadChildren: './page/calendar-plan-edit/calendar-plan-edit.module#CalendarPlanEditPageModule', canActivate: [AuthGuard]},
  {path: 'calendarPlan/select', loadChildren: './page/calendar-plan-select/calendar-plan-select.module#CalendarPlanSelectPageModule', canActivate: [AuthGuard]},
  {path: 'branch/create', loadChildren: './page/branch-create/branch-create.module#BranchCreatePageModule', canActivate: [AuthGuard]},
  {path: 'branch/edit/:id', loadChildren: './page/branch-edit/branch-edit.module#BranchEditPageModule', canActivate: [AuthGuard]},
  {path: 'branch/list', loadChildren: './page/branch-list/branch-list.module#BranchListPageModule', canActivate: [AuthGuard]},
  {path: 'branch/select', loadChildren: './page/branch-select/branch-select.module#BranchSelectPageModule', canActivate: [AuthGuard] },
  {path: 'calendarPeriod/list/:planId', loadChildren: './page/calendar-period-list/calendar-period-list.module#CalendarPeriodListPageModule', canActivate: [AuthGuard]},
  {path: 'calendarPeriod/create/:planId', loadChildren: './page/calendar-period-create/calendar-period-create.module#CalendarPeriodCreatePageModule', canActivate: [AuthGuard]},
  {path: 'calendarPeriod/edit/:planId/:id', loadChildren: './page/calendar-period-edit/calendar-period-edit.module#CalendarPeriodEditPageModule', canActivate: [AuthGuard]},
  {path: 'calendarEvent/create/:planId', loadChildren: './page/calendar-event-create/calendar-event-create.module#CalendarEventCreatePageModule', canActivate: [AuthGuard]},
  {path: 'calendarEvent/list/:planId', loadChildren: './page/calendar-event-list/calendar-event-list.module#CalendarEventListPageModule', canActivate: [AuthGuard]},
  {path: 'calendarEvent/edit/:planId/:id', loadChildren: './page/calendar-event-edit/calendar-event-edit.module#CalendarEventEditPageModule', canActivate: [AuthGuard]},
  {path: 'calendarEventTopic/list/:planId/:eventId', loadChildren: './page/calendar-event-topic-list/calendar-event-topic-list.module#CalendarEventTopicListPageModule', canActivate: [AuthGuard]},
  {path: 'calendarEventTopic/create/:planId/:eventId', loadChildren: './page/calendar-event-topic-create/calendar-event-topic-create.module#CalendarEventTopicCreatePageModule', canActivate: [AuthGuard]},
  {path: 'calendarEventTopic/edit/:planId/:eventId/:id', loadChildren: './page/calendar-event-topic-edit/calendar-event-topic-edit.module#CalendarEventTopicEditPageModule', canActivate: [AuthGuard]},
  {path: 'calendarEventTopic/reorder/:planId', loadChildren: './page/calendar-event-topic-reorder/calendar-event-topic-reorder.module#CalendarEventTopicReorderPageModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
