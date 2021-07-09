import { Component, OnInit, OnDestroy, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { SvgItem } from '../models/svg-item.model';
import { SvgHostDirective } from '../svg-host.directive';
import { SvgItemComponent } from '../svg-item/svg-item.component';

@Component({
  selector: 'app-svg-container',
  templateUrl: './svg-container.component.html',
  styleUrls: ['./svg-container.component.css']
})
export class SvgContainerComponent implements OnInit, OnDestroy {
  @Input() svgItems: SvgItem[] = [];

  @ViewChild(SvgHostDirective, {static: true}) svgHost!: SvgHostDirective;

  currentSvgIndex = 0;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.loadComponent();
    // this.getSvgItems();
  }

  ngOnDestroy(): void {

  }

  loadComponent() {
    // this.currentSvgIndex = (this.currentSvgIndex + 1) % this.svgItems.length;
    console.log(this.currentSvgIndex)

    const svgItem = this.svgItems[this.currentSvgIndex];

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(svgItem.component);

    const viewContainerRef = this.svgHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<SvgItemComponent>(componentFactory);
    componentRef.instance.svgData = svgItem.data;
  }


  selectItem(index: number): void {
    this.currentSvgIndex = index;
    this.loadComponent()
  }

}
