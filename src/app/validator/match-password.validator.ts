import {FormGroup} from '@angular/forms';

export class MatchPasswordValidator {
  static validate(form: FormGroup) {
    const p1 = form.controls.password.value;
    const p2 = form.controls.passwordRepeat.value;

    if (p2.length <= 0) {
      return null;
    }
    if (p2 !== p1) {
      return {'matchPassword': true};
    }
    return null;
  }
}
