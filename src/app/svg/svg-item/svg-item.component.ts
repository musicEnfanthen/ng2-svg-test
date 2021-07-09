import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { SvgItem } from '../models/svg-item.model';

import { Selection } from 'd3-selection';
import * as d3_selection from 'd3-selection';
import * as d3_fetch from 'd3-fetch';

/**
 * The D3Selection interface.
 *
 * It represents the selection of a d3 element.
 */
 export interface D3Selection extends Selection<any, any, any, any> {}

@Component({
    selector: 'app-svg-item',
    templateUrl: './svg-item.component.html',
    styleUrls: ['./svg-item.component.css']
})
export class SvgItemComponent implements OnChanges, OnInit, AfterViewInit {
    @ViewChild('svgElement') svgElement: ElementRef | undefined;

    @Input() svgItem?: SvgItem;

    svg: D3Selection | undefined;
    svgRoot: D3Selection | undefined;
    svgFilePath: string = '';

    description: {[key: string]: string}[] = [];

    fillColor = 'rgb(0, 255, 0)';

    constructor() { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.svgItem.isFirstChange()) {
            this.loadSVG();
        } 
    }

    ngAfterViewInit() {
        console.log(this.svgElement)
        this.loadSVG();
    }

    loadSVG(): void {
        this.svgFilePath = this.svgItem!.data.path;
        this.getSVG();
    }

    reloadSVG():void {
        this.svg = undefined;
        this.svgRoot = undefined;

        this.loadSVG();
    }

    async getSVG() {
        // fetch the SVG file: "xml" is the SVG XML DOM tree
        const svgFileXml = await d3_fetch.svg(this.svgFilePath)
        console.log('svgFileXml', svgFileXml)

        // get the reference to the svg element in the HTML template
        let htmlSVG = undefined;
        htmlSVG =  this.svgElement?.nativeElement;
        // append the root element from the fetched file
        htmlSVG?.appendChild(svgFileXml.getElementById('svg-root'));

        // d3 objects for later use
        this.svg = d3_selection.select(htmlSVG);
        this.svgRoot = this.svg.select('#svg-root');

        // get the svg element from the original SVG file
        const xmlSVG = d3_selection.select(svgFileXml.getElementsByTagName('svg')[0]);
        // copy its "viewBox" attribute to the svg element in the HTML template
        this.svg.attr('viewBox', xmlSVG.attr('viewBox'));


        let tkaGroups = undefined;
        tkaGroups = this.svgRoot.selectAll('g');
        console.log(tkaGroups);
        let _self = this;
        // select every path element in a g element and fill it red
        tkaGroups.each(function () {
            let tkaPath = d3_selection.select(this).select('path');
            tkaPath.on('mouseover', () => _self.onTkaSelect(this));


            tkaPath.style('stroke', _self.fillColor)})
    }


    onTkaSelect(self: any): void {
        const attributes = self.getAttributeNames();
        console.log(attributes)
        const test: any = {}
        attributes.map((attr: any) => {
            console.log(attr)
            test[attr] = self.getAttribute(attr);
            console.log(test)
        })
        this.description.splice(0, 1 , test);

        console.log(this.description)

        // return label;
    }

}
