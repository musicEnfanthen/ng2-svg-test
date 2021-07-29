import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, NgModule } from '@angular/core';

import { SvgItem } from '../models/svg-item.model';
import { SvgDrawingService } from '../svg-drawing.service';

import { BaseType, Selection } from 'd3-selection';
import * as d3_selection from 'd3-selection';
import * as d3_fetch from 'd3-fetch';

/**
 * The D3Selection interface.
 *
 * It represents the selection of a d3 element.
 */
export interface D3Selection extends Selection<any, any, any, any> {}

export interface System {
    id: string,
    name: string
}

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

    systems: System[] = []

    description: {[key: string]: string}[] = [];

    constructor(private svgDrawingService: SvgDrawingService) { }

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

        // Clear systems
        this.systems = [];

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


        const _self = this;

        this.getSystemGroups();
        this.getTkaGroups()

    }

    getSystemGroups(): void {
        if (!this.svgRoot) { return };
        this.svgDrawingService.getSystemGroups(this.svgRoot, this.systems);
    }

    getTkaGroups(): void {
        if (!this.svgRoot) { return };
        this.svgDrawingService.getTkaGroups(this.svgRoot, this.tkaNotes, this.description, this.selectedTkaNotesList, this.isAllNotesSelected);
    }


    onSystemSelect(system: any): void {
        if (!this.svgRoot || !system) { return };
        console.log(system)
        const systemGroupSelection: D3Selection = this.svgRoot.select('#' + system.id);
        console.log(systemGroupSelection)
    }

    onTkaSelect(tkaGroup: any): void {
        this.svgDrawingService.onTkaSelect(tkaGroup, this.description)
    }

    changeAllNotesSelection() {
        this.tkaNotes.map((value: TkaNote) => {
            value.isChecked = this.isAllNotesSelected;
        });
        this.changeSelection()
    }

    changeSelection() {
        this.svgDrawingService.fetchSelectedTka(this.selectedTkaNotesList, this.tkaNotes);
        this.svgDrawingService.checkAllNotesSelection(this.selectedTkaNotesList, this.tkaNotes, this.isAllNotesSelected);
        this.tkaNotes.map((value: TkaNote) => {
            const color = value.isChecked ? this.svgDrawingService.selectionColor : this.svgDrawingService.deselectionColor;
            this.svgDrawingService.colorSelection(this.svgRoot, value, color)
        });
    }

}
