import { Component, OnInit, Input } from '@angular/core';
import { SvgItem } from '../models/svg-item.model';

@Component({
  selector: 'app-svg-container',
  templateUrl: './svg-container.component.html',
  styleUrls: ['./svg-container.component.css']
})
export class SvgContainerComponent implements OnInit {
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
