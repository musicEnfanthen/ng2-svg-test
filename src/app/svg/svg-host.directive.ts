// tslint:disable: directive-selector
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[svgHost]',
})
export class SvgHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
