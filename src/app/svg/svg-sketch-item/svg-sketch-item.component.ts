import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, NgModule } from '@angular/core';

import { SvgItem } from '../models/svg-item.model';

import { BaseType, Selection } from 'd3-selection';
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
    @ViewChild('popover') popover: ElementRef | undefined;
    @ViewChild('svgElement') svgElement: ElementRef | undefined;
    // @ViewChild('pop', { static: false }) pop: any;

    @Input() svgItem?: SvgItem;

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
    // that = this;

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
        const popover = _self.popover
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

            const tooltip = sketchPlaceholderGroup;

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
                console.log('_self.popover', _self.popover)
                console.log('popover!.nativeElement', popover!.nativeElement)
                // popover?.show()

                // window.alert(tooltip);
            })
            .on("mouseenter", function () {
                // tooltip.style("opacity", "1").text('another tooltip');

            })
            .on('mouseout', () => {
                sketchPlaceholderGroupSelection.select('rect').attr('opacity', 0.0);

            })
            .on('click', () => {
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

            // console.log('groupselection', tkaGroupSelection)
            // console.log('g.tka-overlay-group', tkaOverlayGroupSelection)

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

                // get original style
                // const prevStyle = d3_selection.select(tkaPath)
                // console.log('prevStyle', prevStyle);
                // const prevFill = prevStyle.style('fill')
                // console.log('prevFill', prevFill);
                // const prevStroke = prevStyle.style('stroke')
                // console.log('prevStroke', prevStroke);
                // console.log('tkaPathsSelection', tkaPathsSelection);


                tkaOverlayGroupSelection.on('mouseover', () => {    // TODO: only trigger if addedsigns are visible
                    tkaGroupRect.attr('opacity', 0.2);
                    if (tkaNote && !tkaNote.isChecked) {
                        const color = _self.selectionColor;
                        _self._colorSelection(tkaNote, color);
                    };
                    _self.onTkaSelect(tkaGroup);
                    // console.log('tkapath', tkaPath);
                    // d3_selection.select(tkaPath).attr('opacity', 1);
                    // console.log('tkapath', tkaPath);
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

    // changeAllSignsSelection() {
    //     this.tkaNotes.map((value: TkaNote) => {
    //         value.isChecked = this.isAllNotesSelected;
    //     });
    //     this.changeSelection()
    // }

    toggleAllAddedSigns() {                                     // TODO: change only opacity of children, not the whole group?
        const _self = this;
        this.addedSignsIds.forEach( function(id) {
            console.log('id', id)
            const addedSignGroup: D3Selection = _self.svg!.select('#' + id);
            if (addedSignGroup.attr('opacity') === null) { addedSignGroup.attr('opacity', 1)};
            addedSignGroup.attr('opacity') === '0' ? addedSignGroup.attr('opacity', 1) : addedSignGroup.attr('opacity', 0.0);
        })

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


    // private _changeColor (value: TkaNote | undefined, style: string) {        // TODO: check with new SVG-files
    //     if (!value) { return };
    //     const tkaGroupSelection: D3Selection = this.svg!.select('#' + value.id);
    //     const tkaGroupPathsSelection: D3Selection = tkaGroupSelection?.selectAll('path');

    //     tkaGroupPathsSelection?.each(function() {
    //         const tkaGroupPath: d3_selection.BaseType = this;
    //         const tkaGroupPathSelection: D3Selection = d3_selection.select(tkaGroupPath);
    //         console.log('ding', tkaGroupPathSelection.attr('style'));
    //         console.log('ting', tkaGroupPathSelection.attr('style'));
    //         console.log('style', style);

    //         console.log('tkaGroupPathSelection', tkaGroupPathSelection)
    //         if (tkaGroupPathSelection.attr('style').includes('font-family') && tkaGroupPathSelection.attr('style') === this.style) {
    //             tkaGroupPathSelection.style('fill', this.selectionColor);
    //             console.log('dong', tkaGroupPathSelection.attr('style'));
    //         }
    //         else if (tkaGroupPathSelection.attr('style').includes('font-family') && tkaGroupPathSelection.attr('style') != this.style) {
    //             tkaGroupPathSelection.attr('style', this.style);
    //             console.log('dang', tkaGroupPathSelection.attr('style'));
    //         }
    //         else if (tkaGroupPathSelection.attr('style') === this.style) {
    //             tkaGroupPathSelection.style('stroke', this.selectionColor);
    //             console.log('dung', tkaGroupPathSelection.attr('style'));
    //         }
    //         else {
    //             tkaGroupPathSelection.attr('style', this.style);
    //             console.log('doing', tkaGroupPathSelection.attr('style'));
    //         }
    //     });
    // }

    private _colorSelection(value: TkaNote | undefined, color: string) {        // TODO: check with new SVG-files
        if (!value) { return };
        const tkaGroupSelection: D3Selection = this.svg!.select('#' + value.id);
        const tkaGroupPathsSelection: D3Selection = tkaGroupSelection?.selectAll('path');
        const addedSignGroupSelection: D3Selection = tkaGroupSelection.selectAll('g.addedSign');       // maybe instead add a class to all elements somewhere further up
        const addedSignGroupPathsSelection: D3Selection = addedSignGroupSelection?.selectAll('path');

        tkaGroupPathsSelection?.each(function() {
            const tkaGroupPath: d3_selection.BaseType = this;
            const tkaGroupPathSelection: D3Selection = d3_selection.select(tkaGroupPath);
            // console.log('this', tkaGroupPathSelection)
            // console.log('that', tkaGroupPath)
            // console.log('this parent', tkaGroupPathSelection.node().parentNode.parentNode)
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
            if (tkaSignGroupPathSelection.attr('style').includes('font-family')) {
                tkaSignGroupPathSelection.style('fill', addedColor);
            }
            else {
                tkaSignGroupPathSelection.style('stroke', addedColor);
            }
        });
    }
}
