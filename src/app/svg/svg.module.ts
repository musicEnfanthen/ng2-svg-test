import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { SvgContainerComponent } from './svg-container/svg-container.component';
import { SvgItemComponent } from './svg-item/svg-item.component';
import { SvgHostDirective } from './svg-host.directive';

import { SvgLoadingService } from './svg-loading.service';
import { SvgComponent } from './svg.component';

import { SketchViewComponent } from './sketch-view/sketch-view.component';
import { TextViewComponent } from './text-view/text-view.component';
import { SvgSketchContainerComponent } from './svg-sketch-container/svg-sketch-container.component';
import { SvgSketchItemComponent } from './svg-sketch-item/svg-sketch-item.component';

@NgModule({
    declarations: [
        SvgContainerComponent,
        SvgItemComponent,
        SvgHostDirective,
        SvgComponent,
        SketchViewComponent,
        TextViewComponent,
        SvgSketchContainerComponent,
        SvgSketchItemComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgbPopoverModule,
        NgbTooltipModule
    ],
    providers: [SvgLoadingService],
    exports: [
        SvgComponent
    ]
})
export class SvgModule { }
