import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { SvgComponent } from './svg.component';

import { TextViewComponent } from './text-view/text-view.component';
import { SvgContainerComponent } from './text-view/svg-container/svg-container.component';
import { SvgItemComponent } from './text-view/svg-item/svg-item.component';

import { SketchViewComponent } from './sketch-view/sketch-view.component';
import { SvgSketchContainerComponent } from './sketch-view/svg-sketch-container/svg-sketch-container.component';
import { SvgSketchItemComponent } from './sketch-view/svg-sketch-item/svg-sketch-item.component';

import { SvgHostDirective } from './svg-host.directive';

import { SvgLoadingService } from './services/svg-loading.service';
import { SvgSketchLoadingService } from './services/svg-sketch-loading.service';
import { SvgDrawingService } from './services/svg-drawing.service';

@NgModule({
    declarations: [
        SvgComponent,
        TextViewComponent,
        SvgContainerComponent,
        SvgItemComponent,
        SketchViewComponent,
        SvgSketchContainerComponent,
        SvgSketchItemComponent,
        SvgHostDirective,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgbPopoverModule,
        NgbTooltipModule
    ],
    providers: [
        SvgLoadingService,
        SvgSketchLoadingService,
        SvgDrawingService
    ],
    exports: [
        SvgComponent
    ]
})
export class SvgModule { }
