import { Component, OnInit } from '@angular/core';
import { SvgItem } from '../models/svg-item.model';
import { SvgLoadingService } from '../services/svg-loading.service';

@Component({
  selector: 'awg-text-view',
  templateUrl: './text-view.component.html',
  styleUrls: ['./text-view.component.css']
})
export class TextViewComponent implements OnInit {

    svgItems: SvgItem[] = [];

    constructor(private svgLoadingService: SvgLoadingService) { }

    ngOnInit(): void {
      this.svgItems = this.svgLoadingService.getSvgItems();
    }

}
