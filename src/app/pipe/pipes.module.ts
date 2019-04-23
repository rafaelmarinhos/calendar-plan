import {NgModule} from '@angular/core';
import {ReplacePipe} from './replace.pipe';
import {KeysPipe} from './keys';

@NgModule({
  declarations: [
    ReplacePipe,
    KeysPipe
  ],
  imports: [],
  exports: [
    ReplacePipe,
    KeysPipe
  ]
})
export class PipesModule {
}
