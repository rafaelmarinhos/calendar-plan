import {Directive, ElementRef, HostListener, Input} from '@angular/core';

const MASK_MAX_LENGTH = {
  cep: 10,
  plate: 8,
  cpf: 14,
  cnpj: 18,
  phone: 15,
  date: 10,
  time: 5,
  'card-number': 19,
  'card-expire': 5,
  'card-cvv': 3
};

@Directive({
  selector: '[mask]'
})
export class MaskDirective {

  @Input() mask: string;

  constructor(private el: ElementRef) {
  }

  @HostListener('ionInput') onChange() {
    const value = this.applyMask(this.el.nativeElement.value);
    this.el.nativeElement.value = value;
    this.limitValueLength();
  }

  limitValueLength() {
    const value = this.el.nativeElement.value;
    const maxLength = MASK_MAX_LENGTH[this.mask];
    if (value != null && value.length > maxLength) {
      this.el.nativeElement.value = value.substring(0, maxLength);
    }
  }

  applyMask(value) {
    if (!value || !this.mask) { return value; }

    if (this.mask === 'numeric') {
      return value.replace(/\D/g, '');
    } else if (this.mask === 'cep') {
      const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})/);
      return x[3] ? `${x[1]}.${x[2]}-${x[3]}` : x[2] ? `${x[1]}.${x[2]}` : x[1];
    }
    else if (this.mask === 'plate') {
      const x = value.toUpperCase().replace(/[^a-zA-Z0-9]/, '').match(/([A-Z]{0,3})(\d{0,4})/);
      return x[2] ? `${x[1]}-${x[2]}` : x[1];
    }
    else if (this.mask === 'cpf') {
      const x = value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
      return x[4] ? `${x[1]}.${x[2]}.${x[3]}-${x[4]}` : x[3] ? `${x[1]}.${x[2]}.${x[3]}` : x[2] ? `${x[1]}.${x[2]}` : x[1];
    }
    else if (this.mask === 'cnpj') {
      const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
      return x[5] ? `${x[1]}.${x[2]}.${x[3]}/${x[4]}-${x[5]}` : x[4] ? `${x[1]}.${x[2]}.${x[3]}/${x[4]}` : x[3] ? `${x[1]}.${x[2]}.${x[3]}` : x[2] ? `${x[1]}.${x[2]}` : x[1];
    }
    else if (this.mask === 'phone') {
      const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      return x[3] ? `(${x[1]}) ${x[2]}-${x[3]}` : x[2] ? `(${x[1]}) ${x[2]}` : x[1];
    }
    else if (this.mask === 'date') {
      const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,2})(\d{0,4})/);
      let date = x[3] ? `${x[1]}/${x[2]}/${x[3]}` : x[2] ? `${x[1]}/${x[2]}` : x[1];
      if (date.length === 10) {
        const m = /^\s*(3[01]|[12][0-9]|0?[1-9])\/(1[012]|0?[1-9])\/((?:19|20)\d{2})\s*$/.test(date);
        if (!m) date = '';
      }
      return date;
    }
    else if (this.mask === 'time') {
      const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,2})(\d{0,4})/);
      let time = x[2] ? `${x[1]}:${x[2]}` : x[1];
      if (time.length === 5) {
        const m = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(time);
        if (!m) time = '';
      }
      return time;
    }
    else if (this.mask === 'card-number') {
      const x = value.replace(/\D/g, '').match(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/);
      return x[4] ? `${x[1]} ${x[2]} ${x[3]} ${x[4]}` : x[3] ? `${x[1]} ${x[2]} ${x[3]}` : x[2] ? `${x[1]} ${x[2]}` : x[1];
    }
    else if (this.mask === 'card-expire') {
      const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,2})/);
      let date = x[2] ? `${x[1]}/${x[2]}` : x[1];
      if (date.length === 10) {
        const m = /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/.test(date);
        if (!m) date = '';
      }
      return date;
    }
    else if (this.mask === 'card-cvv') {
      const x = value.replace(/\D/g, '').match(/(\d{0,3})/);
      return x[1];
    }
    else {
      return value;
    }
  }

}
