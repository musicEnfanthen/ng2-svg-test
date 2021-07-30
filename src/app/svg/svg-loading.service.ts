import { Injectable } from '@angular/core';

import { SvgItem } from './models/svg-item.model';

@Injectable({
    providedIn: 'root'
})
export class SvgLoadingService {

    getSvgItems(): SvgItem[] {
        return [
            new SvgItem({name: 'M212 TF1_1', path: 'assets//svg-texts/M212_TF1_3rd_proof_Seite1_pfad_210720.svg'}),
            new SvgItem({name: 'M212 TF1_2', path: 'assets//svg-texts/M212_TF1_3rd_proof_Seite2_pfad_210720.svg'})
        ]
    }


}
