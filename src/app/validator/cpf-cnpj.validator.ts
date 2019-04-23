import {FormGroup} from '@angular/forms';

export class CpfCnpjValidator {
  static validate(form: FormGroup) {
    const personType = form.controls.personType.value;
    const cpf = form.controls.cpf.value;
    const cnpj = form.controls.cnpj.value;

    if (personType === 'Pessoa Física') {
      const r = cpf != null && cpf.length === 14 ? null : {'cpfCnpj': true};
      return r;
    } else if (personType === 'Pessoa Jurídica') {
      const r = cnpj != null && cnpj.length === 18 ? null : {'cpfCnpj': true};
      return r;
    }
    return null;
  }
}
