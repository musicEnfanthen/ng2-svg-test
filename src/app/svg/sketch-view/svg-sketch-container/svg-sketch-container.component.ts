import { Component, OnInit, Input } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { SvgItem } from '../../models/svg-item.model';

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

  // custom toggle for the tooltip in order to display the context coming from the emitter
  toggleWithTka(tooltip: NgbTooltip, tka: string) {
    if (tooltip.isOpen()) {
      tooltip.close();
    } else {
      tooltip.open({tka});
    }
  }

}
