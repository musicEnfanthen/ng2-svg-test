import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, NgModule } from '@angular/core';

import { SvgItem } from '../models/svg-item.model';

import { BaseType, Selection } from 'd3-selection';
import * as d3_selection from 'd3-selection';
import * as d3_fetch from 'd3-fetch';
import { isNgTemplate } from '@angular/compiler';

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

export interface TkAEntry {
    measure: number;
    system: number;
    position: string;
    tka: string;
}

export const TkaList: TkAEntry[] = [
    { measure: 1, system: 1, position: '1/8', tka: 'I am a nice TkA.'}
]

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
    deselectionColor = 'black';

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

        // Clear note-list
        this.tkaNotes = [];

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
        const xmlSVG: D3Selection = d3_selection.select(svgFileXml.getElementsByTagName('svg')[0]);
        // Copy its "viewBox" attribute to the svg element in the HTML template
        this.svg.attr('viewBox', xmlSVG.attr('viewBox'));

        const tkaGroups: D3Selection = this.svgRoot.selectAll('g.TkA');
        console.log('tkaGroups', tkaGroups)

        const _self = this;

        // Select every path element in a g element, draw an invisible selection rectangle and recolor the paths
        tkaGroups.each(function () {
            const tkaGroup: d3_selection.BaseType = this;
            const tkaGroupSelection: D3Selection = d3_selection.select(tkaGroup);

            // TODO:check for "id" and "awg" attributes
            const id: string = tkaGroupSelection.attr('id');
            const tka: string = tkaGroupSelection.attr('awg');

            _self.tkaNotes.push({
                'id': id,
                'tka': tka,
                'isChecked': false}
            );

            // magic numbers for overlay boxes
            const tkaOverlayBoxAdditionalSpace: number = 1.5;
            const tkaOverlayBoxCornerRadius: number = 1;

            // create overlay group
            tkaGroupSelection.append('g').attr('class', 'tka-overlay-group');
            const tkaOverlayGroupSelection: D3Selection = tkaGroupSelection.select('g.tka-overlay-group')

            // create overlay box for tka-overlay-group
            const tkaGroupBbox: DOMRect = (tkaGroup as SVGSVGElement).getBBox();
            tkaOverlayGroupSelection.append('rect').attr('width', tkaGroupBbox.width+tkaOverlayBoxAdditionalSpace*2)
                    .attr('height', tkaGroupBbox.height+tkaOverlayBoxAdditionalSpace*2)
                    .attr('x', tkaGroupBbox.x-tkaOverlayBoxAdditionalSpace)
                    .attr('y', tkaGroupBbox.y-tkaOverlayBoxAdditionalSpace)
                    .attr('fill', '#149b9e')
                    .attr('opacity', 0.0)
                    .attr('rx', tkaOverlayBoxCornerRadius)
                    .attr('class', 'tka-overlay-group-box');

            // process all child paths of groupSelection
            const tkaPathsSelection: D3Selection = tkaGroupSelection.selectAll('path'); // TODO: check for "path"

            tkaPathsSelection.each(function() {
                const tkaPath: d3_selection.BaseType = this;

                // create overlay box around tka-overlay-element
                const tkaPathBbox: DOMRect = (tkaPath as SVGSVGElement).getBBox();
                tkaOverlayGroupSelection.append('rect').attr('width', tkaPathBbox.width+tkaOverlayBoxAdditionalSpace*2)
                    .attr('height', tkaPathBbox.height+tkaOverlayBoxAdditionalSpace*2)
                    .attr('x', tkaPathBbox.x-tkaOverlayBoxAdditionalSpace)
                    .attr('y', tkaPathBbox.y-tkaOverlayBoxAdditionalSpace)
                    .attr('fill', '#149b9e')
                    .attr('opacity', 0.0)
                    .attr('rx', tkaOverlayBoxCornerRadius)
                    .attr('class', 'tka-overlay-ele-box');

                // show box over tkagroup on mouseover
                const tkaGroupRect: D3Selection = tkaGroupSelection.selectAll('rect.tka-overlay-group-box');
                const tkaNote: TkaNote | undefined = _self.tkaNotes.find(x => x.id === id);

                // get actual svg of tkagrouprect
                tkaGroupRect.each(function() {
                    // console.log('tkaGroupRect', this as SVGSVGElement);
                });

                tkaOverlayGroupSelection.on('mouseover', () => {
                    tkaGroupRect.attr('opacity', 0.2);
                    if (tkaNote && !tkaNote.isChecked) {
                        const color = _self.selectionColor;
                        _self._colorSelection(tkaNote, color);
                    };
                    _self.onTkaSelect(tkaGroup);
                })
                .on('mouseout', () => {
                    tkaGroupRect.attr('opacity', 0.0);
                    const color = (tkaNote && tkaNote.isChecked) ? _self.selectionColor : _self.deselectionColor;
                    _self._colorSelection(tkaNote, color)
                })
                .on('click', () => {
                    if (tkaNote) {
                        tkaNote.isChecked = !tkaNote.isChecked;
                    }
                    _self._fetchSelectedTka();
                    _self._checkAllNotesSelection();
                });
            });
        });
    }

    onTkaSelect(tkaGroup: any): void {
        console.log('self', tkaGroup)
        const attributes: string[] = tkaGroup?.getAttributeNames();
        const tkaNoteText: string = d3_selection.select(tkaGroup).attr('awg');  // TODO: check for correct attr name
        //console.log(attributes)
        console.log(tkaNoteText)

        const test: {[key:string]: string} = {}
        attributes.map((attr: string) => {
            test[attr] = tkaGroup?.getAttribute(attr);
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
        this._checkAllNotesSelection();
        this.tkaNotes.map((value: TkaNote) => {
            const color = value.isChecked ? this.selectionColor : this.deselectionColor;
            this._colorSelection(value, color)
        });
    }

    private _checkAllNotesSelection() {
        if (this.selectedTkaNotesList.length === this.tkaNotes.length) {
            this.isAllNotesSelected = true
        }
        else if (this.selectedTkaNotesList.length === 0) {
            this.isAllNotesSelected = false
        }
    }

    private _fetchSelectedTka() {
        this.selectedTkaNotesList = this.tkaNotes.filter((value, index) => {
            return value.isChecked
        });
    }


    private _colorSelection(value: TkaNote | undefined, color: string) {        // TODO: check with new SVG-files
        if (!value) { return };
        const tkaGroupSelection: D3Selection = this.svg!.select('#' + value.id);
        const tkaGroupPathsSelection: D3Selection = tkaGroupSelection?.selectAll('path');

        tkaGroupPathsSelection?.each(function() {
            const tkaGroupPath: d3_selection.BaseType = this;
            const tkaGroupPathSelection: D3Selection = d3_selection.select(tkaGroupPath);
            if (tkaGroupPathSelection.attr('style').includes('font-family')) {
                tkaGroupPathSelection.style('fill', color);
            }
            else {
                tkaGroupPathSelection.style('stroke', color);
            }
        });
    }

}
