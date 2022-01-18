import { Injectable } from '@angular/core';

import * as d3_selection from 'd3-selection';
import * as d3_fetch from 'd3-fetch';
import { TkaList } from '../text-view/svg-item/svg-item.component';

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

@Injectable()
export class SvgDrawingService {

    constructor() { }

    fillColor = '#149b9e';
    selectionColor = 'red';
    deselectionColor = 'black';

    fetchSvgFile(path: string): Promise<Document> {
        return d3_fetch.svg(path);
    }

    getSystemGroups(svgRoot: D3Selection, systems: System[]): void {
        if (!svgRoot) { return };

        const systemGroups: D3Selection = svgRoot.selectAll('g.system')
        systemGroups.each(function () {
            const systemGroup: d3_selection.BaseType = this;
            const systemGroupSelection: D3Selection = d3_selection.select(systemGroup);
            const id: string = systemGroupSelection.attr('id');
            systems.push({
                'id': id,
                'name': id }
            );
        })
    }

    getTkaGroups(svgRoot: D3Selection, tkaNotes: TkaNote[], description: any, selectedTakNotesList: TkaNote[], isAllNotesSelected: boolean): void {
        if (!svgRoot) { return }

        const tkaGroups: D3Selection = svgRoot.selectAll('g.tka');
        console.log('tkaGroups', tkaGroups)

        const _self = this;
        // Select every path element in a g element, draw an invisible selection rectangle and recolor the paths
        tkaGroups.each(function () {
            const tkaGroup: d3_selection.BaseType = this;
            const tkaGroupSelection: D3Selection = d3_selection.select(tkaGroup);

            // TODO:check for "id" and "awg" attributes
            const id: string = tkaGroupSelection.attr('id');
            const tka: TkAEntry| undefined = TkaList.find(entry => entry.svgGroupId === id);
            console.log('id', id)
            console.log('tka', tka)

            tkaNotes.push({
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
                    .attr('fill', _self.fillColor)
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
                    .attr('fill', _self.fillColor)
                    .attr('opacity', 0.0)
                    .attr('rx', tkaOverlayBoxCornerRadius)
                    .attr('class', 'tka-overlay-ele-box');

                // show box over tkagroup on mouseover
                const tkaGroupRect: D3Selection = tkaGroupSelection.selectAll('rect.tka-overlay-group-box');
                const tkaNote: TkaNote | undefined = tkaNotes.find((note: TkaNote) => note.id === id);

                tkaOverlayGroupSelection.on('mouseover', () => {
                    tkaGroupRect.attr('opacity', 0.2);
                    if (tkaNote && !tkaNote.isChecked) {
                        const color = _self.selectionColor;
                        _self.colorSelection(svgRoot, tkaNote, color);
                    };
                    _self.onTkaSelect(tkaGroup, description);
                })
                .on('mouseout', () => {
                    tkaGroupRect.attr('opacity', 0.0);
                    const color = (tkaNote && tkaNote.isChecked) ? _self.selectionColor : _self.deselectionColor;
                    _self.colorSelection(svgRoot, tkaNote, color)
                })
                .on('click', () => {
                    if (tkaNote) {
                        tkaNote.isChecked = !tkaNote.isChecked;
                    }
                    selectedTakNotesList = _self.fetchSelectedTkaNotes(tkaNotes);
                    _self.checkAllNotesSelection(selectedTakNotesList, tkaNotes, isAllNotesSelected);
                });
            })
        });
    };

    colorSelection(svgRoot: D3Selection | undefined, value: TkaNote | undefined, color: string): void {        // TODO: check with new SVG-files
        if (!svgRoot || !value) { return };
        const tkaGroupSelection: D3Selection = svgRoot.select('#' + value.id);
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

    onTkaSelect(tkaGroup: any, description: {[key: string]: string}[]): void {
      if (!tkaGroup) { return }

      const attributes: string[] = tkaGroup.getAttributeNames();
      const tkaNote: TkAEntry| undefined = TkaList.find(entry => entry.svgGroupId === tkaGroup[attributes[0]]);

      console.log('tkaNote', tkaNote)
      console.log('attributes', attributes)

      const test: {[key:string]: string} = {}
      attributes.map((attr: string) => {
          test[attr] = tkaGroup?.getAttribute(attr);
      })
      description.splice(0, 1 , test);
  }

  checkAllNotesSelection(selectedTkaNotesList: TkaNote[], tkaNotes: TkaNote[], isAllNotesSelected: boolean): void {
      if (selectedTkaNotesList.length === tkaNotes.length) {
          isAllNotesSelected = true
      }
      else if (selectedTkaNotesList.length === 0) {
          isAllNotesSelected = false
      }
  }

    fetchSelectedTkaNotes(tkaNotes: TkaNote[],): TkaNote[] {
      return tkaNotes.filter((note, index) => {
          return note.isChecked
      });
  }
}
