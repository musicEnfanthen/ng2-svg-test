import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { SvgData } from '../models/svg-data';

@Component({
    selector: 'app-svg-item',
    templateUrl: './svg-item.component.html',
    styleUrls: ['./svg-item.component.css']
})
export class SvgItemComponent implements SvgData {
    @Input() svgData!: any;

    @ViewChild('svgItem') svgItem: ElementRef | undefined;

    constructor() { }

    ngOnInit(): void {
        console.log(this.svgData.path)
    }


    ngAfterViewInit() {
        console.log(this.svgItem?.nativeElement)
    }

}
