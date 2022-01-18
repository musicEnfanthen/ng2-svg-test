import { Component, OnInit } from '@angular/core';

import { SvgItem } from './models/svg-item.model';
import { SvgLoadingService } from './services/svg-loading.service';

@Component({
  selector: 'app-svg',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.css']
})
export class SvgComponent implements OnInit {
  svgItems: SvgItem[] = [];

  constructor(private svgLoadingService: SvgLoadingService) { }

  ngOnInit(): void {
    this.svgItems = this.svgLoadingService.getSvgItems();
  }

}
