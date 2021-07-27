import { Component, OnInit } from '@angular/core';
import { SvgItem } from '../models/svg-item.model';
import { SvgSketchLoadingService } from '../svg-sketch-loading.service';

@Component({
  selector: 'awg-sketch-view',
  templateUrl: './sketch-view.component.html',
  styleUrls: ['./sketch-view.component.css']
})
export class SketchViewComponent implements OnInit {

    svgItems: SvgItem[] = [];

    constructor(private svgSketchLoadingService: SvgSketchLoadingService) { }

    ngOnInit(): void {
      this.svgItems = this.svgSketchLoadingService.getSvgItems();
      console.log('svgItems', this.svgItems)
    }

}
