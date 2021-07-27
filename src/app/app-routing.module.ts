import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SketchViewComponent } from './svg/sketch-view/sketch-view.component';
import { TextViewComponent } from './svg/text-view/text-view.component';

const routes: Routes = [
    { path: 'textedition', component: TextViewComponent },
    { path: 'skizzenedition', component: SketchViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
