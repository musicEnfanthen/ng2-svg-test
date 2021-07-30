import { Injectable } from '@angular/core';

import { SvgItem } from './models/svg-item.model';

@Injectable()
export class SvgSketchLoadingService {

    getSvgItems(): SvgItem[] {
        return [
            // new SvgItem({name: 'M212 TF1', path: 'assets/M212_TF1.svg'}),
            new SvgItem({name: 'M212 Sk1_1', path: 'assets/svg-sketches/M212_Sk1_1von5_210616_bearbeitet_path.svg'}),
            new SvgItem({name: 'SkI_2', path: 'assets/svg-sketches/SkI_2.svg'}),
            new SvgItem({name: 'M212 Sk3', path: 'assets/svg-sketches/M212_Sk3_1von1_210616_bearbeitet_path.svg'}),
            new SvgItem({name: 'M212 Sk4', path: 'assets/svg-sketches/M212_Sk4_1von1_210616_bearbeitet_path.svg'}),
            new SvgItem({name: 'M212 Sk5', path: 'assets/svg-sketches/M212_Sk5_1von1_210616_bearbeitet_path.svg'})
        ]
    }


}
