import { Injectable } from '@angular/core';

import { SvgItem } from './models/svg-item.model';

@Injectable({
    providedIn: 'root'
})
export class SvgLoadingService {

    getSvgItems(): SvgItem[] {
        return [
            new SvgItem({name: 'M212 TF1', path: 'assets/M212_TF1.svg'}),
            new SvgItem({name: 'OP12/I SkI/2', path: 'assets/SkI_2.svg'})
        ]
    }


}
