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

export interface TkaNote {
    id: string,
    tka: string,
    isChecked: boolean
}

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
    svgFilePath = '';

    tkaNotes: TkaNote[] = [];
    selectedTkaNotesList: TkaNote[] = [];
    isAllNotesSelected: boolean = false;

    description: {[key: string]: string}[] = [];

    fillColor = '#149b9e';
    selectionColor = 'red';

    constructor() { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.svgItem.isFirstChange()) {
            this.reloadSVG();
        }
    }

    ngAfterViewInit() {
        this.loadSVG();
    }

    loadSVG(): void {
        this.svgFilePath = this.svgItem!.data.path;
        this.getSVG();
    }

    reloadSVG():void {
        // Clear svg by removing all child node with D3
        this.svg?.selectAll('*').remove();
        this.svgRoot?.selectAll('*').remove();

        // Clear description
        this.description = [];

        this.loadSVG();
    }

    async getSVG() {
        // Fetch the SVG file: "xml" is the SVG XML DOM tree
        const svgFileXml = await d3_fetch.svg(this.svgFilePath)

        // Get the reference to the svg element in the HTML template
        const htmlSVG =  this.svgElement?.nativeElement;
        // Append the root element from the fetched file
        htmlSVG?.appendChild(svgFileXml.getElementById('svg-root'));

        // D3 objects for later use
        this.svg = d3_selection.select(htmlSVG);
        this.svgRoot = this.svg.select('#svg-root');

        // Get the svg element from the original SVG file
        const xmlSVG = d3_selection.select(svgFileXml.getElementsByTagName('svg')[0]);
        // Copy its "viewBox" attribute to the svg element in the HTML template
        this.svg.attr('viewBox', xmlSVG.attr('viewBox'));

        const tkaGroups = this.svgRoot.selectAll('g.TkA');
        console.log('tkaGroups', tkaGroups)

        const _self = this;

        // Select every path element in a g element, draw an invisible selection rectangle and recolor the paths
        tkaGroups.each(function () {
            const groupEle = this;
            const groupSelection = d3_selection.select(groupEle);

            const id = groupSelection.attr('id');
            const tka = groupSelection.attr('awg');

            const tkaPaths = groupSelection.selectAll('path');

            _self.tkaNotes.push({
                'id': id,
                'tka': tka,
                'isChecked': false}
            );

            tkaPaths.each(function() {
                const tkaPath = d3_selection.select(this);
                const tkaPathBbox = (this as SVGSVGElement).getBBox();
                groupSelection.append('rect').attr('width', tkaPathBbox.width)
                    .attr('height', tkaPathBbox.height)
                    .attr('x', tkaPathBbox.x)
                    .attr('y', tkaPathBbox.y)
                    .attr('fill', 'red')
                    .attr('opacity', 0.0);

                const tkaPathRect = groupSelection.selectAll('rect');
                tkaPathRect.on('mouseover', () => _self.onTkaSelect(groupEle));

                // if (tkaPath.attr('style').includes('fill')) {
                //     tkaPath.style('stroke', _self.fillColor);
                // }
                // else {
                //     tkaPath.style('fill', _self.fillColor);
                // }
            });
        });
    }


    onTkaSelect(self: any): void {
        console.log('self', self)
        const attributes = self.getAttributeNames();
        const tkaNote = d3_selection.select(self).attr('awg');
        //console.log(attributes)
        console.log(tkaNote)

        const test: any = {}
        attributes.map((attr: any) => {
            test[attr] = self.getAttribute(attr);
        })
        this.description.splice(0, 1 , test);

        // console.log(this.description[0])

        // Return label;
    }


    changeAllNotesSelection() {
        this.tkaNotes.map((value: TkaNote) => {
            value.isChecked = this.isAllNotesSelected;
        });
        this.changeSelection()
    }

    changeSelection() {
        this._fetchSelectedTka();
        this.tkaNotes.map((value: TkaNote) => {
            const color = value.isChecked ? this.selectionColor : 'black';
            this._colorSelection(value, color)
        })
    }


    private _fetchSelectedTka() {
        this.selectedTkaNotesList = this.tkaNotes.filter((value, index) => {
            return value.isChecked
        });
    }

    private _colorSelection(value: TkaNote, color: string) {
        const groupSelection = this.svg?.select('#' + value.id);
        const tkaPaths = groupSelection?.selectAll('path');

        tkaPaths?.each(function() {
            const tkaPath = d3_selection.select(this);
            if (tkaPath.attr('style').includes('font-family')) {
                tkaPath.style('fill', color);
            }
            else {
                tkaPath.style('stroke', color);
            }
        });
    }

}
