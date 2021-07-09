import { Injectable } from '@angular/core';

import { SvgItemComponent } from './svg-item/svg-item.component';
import { SvgItem } from './models/svg-item.model';

import { M212TF1Component } from './svg-components/m212-tf1/m212-tf1.component';

@Injectable({
    providedIn: 'root'
})
export class SvgLoadingService {

    getSvgItems(): SvgItem[] {
        return [
            new SvgItem(M212TF1Component, {name: 'M212 TF1', path: 'assets/M212_TF1.svg'}),
            new SvgItem(SvgItemComponent, {name: 'OP12/I SkI/2', path: 'assets/SkI_2.svg'})
        ]
    }


}
