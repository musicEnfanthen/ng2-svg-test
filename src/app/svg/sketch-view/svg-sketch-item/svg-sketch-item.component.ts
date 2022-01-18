import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, NgModule, Output, EventEmitter } from '@angular/core';

import { SvgItem } from '../../models/svg-item.model';

import { BaseType, Selection } from 'd3-selection';
import * as d3_selection from 'd3-selection';
import * as d3_fetch from 'd3-fetch';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';


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
    { measure: 1, system: 3, position: '2/8', tka: '[a]c2 überschreibt [b]b1 (oder [b]ces2?)'},
    { measure: 2, system: 3, position: '4/8', tka: '[#] zu gis1 ergänzt mit Blick auf Textfassung 2 und Textfassung 3 (op. 12/1)'}
]

@Component({
    selector: 'awg-svg-sketch-item',
    templateUrl: './svg-sketch-item.component.html',
    styleUrls: ['./svg-sketch-item.component.css']
})
export class SvgSketchItemComponent implements OnChanges, OnInit, AfterViewInit {
    @ViewChild('svgElement') svgElement: ElementRef | undefined;

    @Input() svgItem?: SvgItem;
    @Output() placeholderClick = new EventEmitter();
    @Output() tipemit = new EventEmitter();

    svg: D3Selection | undefined;
    svgRoot: D3Selection | undefined;
    svgFilePath = '';

    tkaNotes: TkaNote[] = [];
    selectedTkaNotesList: TkaNote[] = [];
    isAllNotesSelected: boolean = false;
    isAllAddedSignsHidden: boolean = false;
    addedSignsIds: Array<string> = [];

    description: {[key: string]: string}[] = [];

    fillColor = '#149b9e';
    selectionColor = 'red';
    deselectionColor = 'black';
    addedColor = '#7d7d7d';

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
        this.addedSignsIds = [];

        this.loadSVG();
    }

    async getSVG() {
        const _self = this;

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

        const tkaGroups: D3Selection = this.svgRoot.selectAll('g.tkk');
        const sketchPlaceholdersGroup: D3Selection = this.svgRoot.selectAll('g.placeholder');

        // Get IDs of added signs
        const addedSignGroups: D3Selection = this.svgRoot.selectAll('g.addedSign');
        addedSignGroups.each(function() {
            const id: string = d3_selection.select(this).attr('id');
            _self.addedSignsIds.push(id)
        });

        // create overlay with link for placeholders
        sketchPlaceholdersGroup.each(function () {
            const sketchPlaceholderGroup: d3_selection.BaseType = this;
            const sketchPlaceholderGroupSelection: D3Selection = d3_selection.select(sketchPlaceholderGroup);

            // create overlay box
            const sketchPlaceholderGroupBbox: DOMRect = (sketchPlaceholderGroup as SVGSVGElement).getBBox();
            sketchPlaceholderGroupSelection.append('rect').attr('width', sketchPlaceholderGroupBbox.width)
                    .attr('height', sketchPlaceholderGroupBbox.height)
                    .attr('x', sketchPlaceholderGroupBbox.x)
                    .attr('y', sketchPlaceholderGroupBbox.y)
                    .attr('fill', '#149b9e')
                    .attr('opacity', 0.0)
                    .attr('class', 'placeholder-overlay-box')

            sketchPlaceholderGroupSelection.select('rect').append('title').text('tooltip');

            console.log('sketchPlaceholdersGroupSelection', sketchPlaceholderGroupSelection);
            console.log('sketchPlaceholdersGroupSelectionRect', sketchPlaceholderGroupSelection.select('rect'));
            sketchPlaceholderGroupSelection.on('mouseover', () => {
                sketchPlaceholderGroupSelection.select('rect').attr('opacity', 0.2);
            })
            .on("mouseenter", function () {
                // testing tooltip
                _self.tipemit.emit('this is a tka');
            })
            .on('mouseout', () => {
                sketchPlaceholderGroupSelection.select('rect').attr('opacity', 0.0);
                _self.tipemit.emit();
            })
            .on('click', () => {
                _self.placeholderClick.emit(_self.svgItem);     // TODO: link to the proper sketch, not just itself
            })
        });

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
                const tkaPathSelection: D3Selection = d3_selection.select(tkaPath)
                const tkaPathParent: d3_selection.BaseType = tkaPathSelection.node().parentNode
                const tkaPathParentSelection: D3Selection = d3_selection.select(tkaPathParent)

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
                });

                tkaOverlayGroupSelection.on('mouseover', () => {
                    if (!(tkaPathParentSelection.attr('opacity') === '0')) {
                        tkaGroupRect.attr('opacity', 0.2);
                        if (tkaNote && !tkaNote.isChecked) {
                            const color = _self.selectionColor;
                            _self._colorSelection(tkaNote, color);
                        };
                        _self.onTkaSelect(tkaGroup);
                        }
                    })
                    .on('mouseout', () => {
                        if (!(tkaPathParentSelection.attr('opacity') === '0')) {
                            tkaGroupRect.attr('opacity', 0.0);
                            const color = (tkaNote && tkaNote.isChecked) ? _self.selectionColor : _self.deselectionColor;
                            _self._colorSelection(tkaNote, color)
                            }
                    })
                    .on('click', () => {
                        if (!(tkaPathParentSelection.attr('opacity') === '0')) {
                            if (tkaNote) {
                                tkaNote.isChecked = !tkaNote.isChecked;
                            }
                            _self._fetchSelectedTka();
                            _self._checkAllNotesSelection();
                        }
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
        // Return label;
    }

    changeAllNotesSelection() {
        this.tkaNotes.map((value: TkaNote) => {
            value.isChecked = this.isAllNotesSelected;
        });
        this.changeSelection()
    }

    // changeAllSignsSelection() {
    //     this.tkaNotes.map((value: TkaNote) => {
    //         value.isChecked = this.isAllNotesSelected;
    //     });
    //     this.changeSelection()
    // }

    toggleAllAddedSigns() {                                     // TODO: change only opacity of children, not the whole group?
        const _self = this;                                     // TODO: maybe also deselect all currently selected added signs(-groups)?
        this.addedSignsIds.forEach( function(id) {
            console.log('id', id)
            const addedSignGroup: D3Selection = _self.svg!.select('#' + id);
            if (addedSignGroup.attr('opacity') === null) { addedSignGroup.attr('opacity', 1)};
            addedSignGroup.attr('opacity') === '0' ? addedSignGroup.attr('opacity', 1) : addedSignGroup.attr('opacity', 0.0);
        });
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
        const addedSignGroupSelection: D3Selection = tkaGroupSelection.selectAll('g.addedSign');       // maybe instead add a class to all elements somewhere further up
        const addedSignGroupPathsSelection: D3Selection = addedSignGroupSelection?.selectAll('path');

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

        addedSignGroupPathsSelection.each(function() {
            const tkaSignGroupPath: d3_selection.BaseType = this;
            const tkaSignGroupPathSelection: D3Selection = d3_selection.select(tkaSignGroupPath);
            const addedColor = color === 'black' ? '#7d7d7d' : 'red';                               // TODO: change to reference addedColor
            if (tkaSignGroupPathSelection.attr('style').includes('font-family')) {                  // TODO: merge with the above once proper SVG-files are available
                tkaSignGroupPathSelection.style('fill', addedColor);                                //       (check for addedSign-class in parent)
            }
            else {
                tkaSignGroupPathSelection.style('stroke', addedColor);
            }
        });
    }
}
