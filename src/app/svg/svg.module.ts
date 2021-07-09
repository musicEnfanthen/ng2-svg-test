import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SvgContainerComponent } from './svg-container/svg-container.component';
import { SvgItemComponent } from './svg-item/svg-item.component';
import { SvgHostDirective } from './svg-host.directive';

import { SvgLoadingService } from './svg-loading.service';
import { SvgComponent } from './svg.component';
import { M212TF1Component } from './svg-components/m212-tf1/m212-tf1.component';



@NgModule({
    declarations: [
        SvgContainerComponent,
        SvgItemComponent,
        SvgHostDirective,
        SvgComponent,
        M212TF1Component],
    imports: [
        CommonModule
    ],
    providers: [SvgLoadingService],
    exports: [
        SvgComponent
    ]
})
export class SvgModule { }
