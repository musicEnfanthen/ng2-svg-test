import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as d3_selection from 'd3-selection';
import { Selection } from 'd3-selection';
import * as d3_fetch from 'd3-fetch';

/**
 * The D3Selection interface.
 *
 * It represents the selection of a d3 element.
 */
export interface D3Selection extends Selection<any, any, any, any> {}

@Component({
    selector: 'app-m212-tf1',
    templateUrl: './m212-tf1.component.html',
    styleUrls: ['./m212-tf1.component.css']
})
export class M212TF1Component implements OnInit, AfterViewInit {
    @ViewChild('svgItem') svgItem: ElementRef | undefined;

    svg: D3Selection | undefined;
    svgRoot: D3Selection | undefined;
    path = "assets/M212_TF1.svg";

    description: {[key: string]: string}[] = [];

    fillColor = 'rgb(0, 255, 0)';

    constructor() { }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this.getSVG()
    }

    async getSVG() {
        // fetch the SVG file: "xml" is the SVG XML DOM tree
        const svgFileXml = await d3_fetch.svg(this.path)
        console.log(svgFileXml)

        // get the reference to the svg element in the HTML template
        let htmlSVG = this.svgItem?.nativeElement;
        // append the root element from the fetched file
        htmlSVG?.appendChild(svgFileXml.getElementById('svg-root'));

        // d3 objects for later use
        this.svg = d3_selection.select(htmlSVG);
        this.svgRoot = this.svg.select('#svg-root');

        // get the svg element from the original SVG file
        const xmlSVG = d3_selection.select(svgFileXml.getElementsByTagName('svg')[0]);
        // copy its "viewBox" attribute to the svg element in the HTML template
        this.svg.attr('viewBox', xmlSVG.attr('viewBox'));


        let tkaGroups = this.svgRoot.selectAll('g')
        console.log(tkaGroups)
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
