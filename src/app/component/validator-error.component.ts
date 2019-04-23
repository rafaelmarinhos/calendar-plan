import {Component, Input} from '@angular/core';

@Component({
  selector: 'validator-error',
  template: `
    <span *ngIf="(c.pristine && c.invalid) || (c.invalid  && c.touched)">*</span>
    <ng-container *ngIf="c.errors && c.invalid && (c.dirty || c.touched)">
      <p *ngIf="c.errors.required; else error2">Campo obrigatório</p>
      <ng-template #error2><p *ngIf="c.errors.email; else error3">Insira no formato: nome@email.com</p></ng-template>
      <ng-template #error3><p *ngIf="c.errors.minlength; else error4">Insira no mínimo {{param}} caracteres</p></ng-template>
      <ng-template #error4><p *ngIf="c.errors.maxlength; else error5">Insira no máximo {{param}} caracteres</p></ng-template>
      <ng-template #error5><p *ngIf="c.errors.cardNumber; else error6">Número de cartão inválido</p></ng-template>
      <ng-template #error6><p *ngIf="c.errors.expirationDate; else error7">Deve ser depois de hoje</p></ng-template>
      <ng-template #error7><p *ngIf="c.errors.dateTimeBefore; else error8">Deve ser depois de agora</p></ng-template>
      <ng-template #error8><p *ngIf="c.errors.plate; else error9">Placa no formato AAA 1234</p></ng-template>
      <ng-template #error9><p *ngIf="c.errors.lastName">Informe o nome completo</p></ng-template>
    </ng-container>
  `,
  styles: [
    'p { font-weight: normal; color: var(--ion-color-success-tint); font-size: .75rem; }',
    'span { color: var(--ion-color-success); }'
  ]
})
export class ValidatorErrorComponent {

  @Input() control: any;
  @Input() param: any;

  constructor() {
  }

  get c() {
    return this.control;
  }
}
