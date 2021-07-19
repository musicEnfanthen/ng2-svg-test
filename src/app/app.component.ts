import { Component, OnInit } from '@angular/core';

import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ng2-svg-test';


  constructor(ngbConfig: NgbConfig) {
    // Disable Bootstrap animation
    ngbConfig.animation = false;
   }

  ngOnInit() {
  }

}
