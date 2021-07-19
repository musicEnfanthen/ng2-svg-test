import { Component, OnInit, Input } from '@angular/core';
import { SvgItem } from '../models/svg-item.model';

@Component({
  selector: 'awg-svg-sketch-container',
  templateUrl: './svg-sketch-container.component.html',
  styleUrls: ['./svg-sketch-container.component.css']
})
export class SvgSketchContainerComponent implements OnInit {
  @Input() svgItems: SvgItem[] = [];

  selectedSvgItem?: SvgItem;

  constructor() { }

  ngOnInit(): void {
    this.onSelectItem(this.svgItems[0]);
  }

  onSelectItem(item: SvgItem): void {
    this.selectedSvgItem = item;
    console.log('CONTAINER #selectedSvgItem  ', this.selectedSvgItem);
  }

}
