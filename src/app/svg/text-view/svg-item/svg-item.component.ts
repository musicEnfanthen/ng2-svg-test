import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { SvgItem } from '../../models/svg-item.model';
import { SvgDrawingService } from '../../services/svg-drawing.service';

import * as d3_selection from 'd3-selection';

/**
 * The D3Selection interface.
 *
 * It represents the selection of a d3 element.
 */
export interface D3Selection extends d3_selection.Selection<any, any, any, any> {}

export interface System {
    id: string,
    name: string
}

export interface TkaNote {
    id: string,
    tka: TkAEntry | undefined,
    isChecked: boolean
}

export interface TkAEntry {
    svgGroupId: string,
    measure: number;
    system: string;
    position: string;
    comment: string;
}

export const TkaList: TkAEntry[] = [
    { svgGroupId: 'm212_tf1_ms1_st2t3_ts1p5t2', measure: 1, system: 'Klav.', position: '(2/8) bis Taktende', comment: 'Crescendogabel versetzt von über Klav. o.'},
    { svgGroupId: 'm212_tf1_ms2_st2t3_ts1t2_5', measure: 2, system: 'Klav.', position: '(1–4/8)', comment: 'Decrescendogabel versetzt von über Klav. o.'},
    { svgGroupId: 'm212_tf1_ms2_st2_ts2_5', measure: 2, system: 'Klav. o.', position: '4/8', comment: '[#] zu gis1 ergänzt mit Blick auf Textfassung 2 und Textfassung 3 (op. 12/1).'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 5, system: 'Klav. o.', position: '(1/4)', comment: 'Triolenklammer versetzt von über Klav. u.'},
    { svgGroupId: 'm212_tf1_ms5_st1_ts2', measure: 5, system: 'Klav.', position: '1. Note', comment: '[pp] versetzt von unter Klav. u.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1_33', measure: 5, system: 'Ges.', position: '3/8', comment: 'Text: Komma nach (ver-gan-)gen ergänzt mit Blick auf Rosegger_PM.'},
    { svgGroupId: 'm212_tf1_ms6_st2t3_ts1', measure: 6, system: 'Klav.', position: '1. Note', comment: 'Ende der Crescendogabel versetzt von Ende T. 5.'},
    { svgGroupId: 'm212_tf1_ms9_st1_1p66', measure: 9, system: 'Ges.', position: '2. Note', comment: 'Text: Komma nach (Ma-ri-)a ergänzt mit Blick auf Rosegger_PM.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 13, system: 'Ges.', position: '2/8', comment: '[ppp]: Entzifferung schwierig, Tinte stark verschmiert.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 14, system: 'Klav. u.', position: '1/8', comment: '([a]) zu e/a als redundant weggelassen. B§: Akkoladenwechsel nach T. 12.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 14, system: 'Ges.', position: '2. Note', comment: 'Text: Komma nach (Ma-ri-)a ergänzt mit Blick auf Rosegger_PM.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 18, system: 'Ges.', position: '1. Note', comment: 'Text sic: (Ver-)storb(-nen) ohne Binnen-Apostroph. Rosegger_PM: Verstorb’nen.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 22, system: 'Klav. o.', position: '', comment: 'Anfang der Ligaturbögen zu H/g ergänzt analog Fortsetzung der Bögen von T. 22 in T. 23. B§: Akkoladenwechsel nach T. 22.'},
    { svgGroupId: 'm212_tf1_ms5_st2t3_ts1t1p66', measure: 23, system: 'Klav.', position: '', comment: '([#]) zu Gis1/Cis und ([a]) zu H/g als redundant weggelassen. B§: Akkoladenwechsel nach T. 22.\n'},

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
        const svgFileXml: Document = await this.svgDrawingService.fetchSvgFile(this.svgFilePath)

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


        this.getSystemGroups();
        this.getTkaGroups()

    }

    getSystemGroups(): void {
        if (!this.svgRoot) { return }
        this.svgDrawingService.getSystemGroups(this.svgRoot, this.systems);
    }

    getTkaGroups(): void {
        if (!this.svgRoot) { return }
        this.svgDrawingService.getTkaGroups(this.svgRoot, this.tkaNotes, this.description, this.selectedTkaNotesList, this.isAllNotesSelected);
    }


    onSystemSelect(system: any): void {
        if (!this.svgRoot || !system) { return }
        const systemGroupSelection: D3Selection = this.svgRoot.select('#' + system.id);
        console.log(systemGroupSelection)
    }

    onTkaSelect(tkaGroup: any): void {
        this.svgDrawingService.onTkaSelect(tkaGroup, this.description)
    }

    changeAllNotesSelection() {
        this.tkaNotes.map((note: TkaNote) => {
            note.isChecked = this.isAllNotesSelected;
        });
        this.changeSelection()
    }

    changeSelection() {
        this.selectedTkaNotesList = this.svgDrawingService.fetchSelectedTkaNotes(this.tkaNotes);
        this.svgDrawingService.checkAllNotesSelection(this.selectedTkaNotesList, this.tkaNotes, this.isAllNotesSelected);
        this.tkaNotes.map((note: TkaNote) => {
            const color = note.isChecked ? this.svgDrawingService.selectionColor : this.svgDrawingService.deselectionColor;
            this.svgDrawingService.colorSelection(this.svgRoot, note, color)
        });
    }

}
