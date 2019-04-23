import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorErrorComponent } from './validator-error.component';
import { RatingComponent } from './rating/rating.component';

@NgModule({
  declarations: [
    ValidatorErrorComponent,
    RatingComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ValidatorErrorComponent,
    RatingComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ComponentsModule {
}
