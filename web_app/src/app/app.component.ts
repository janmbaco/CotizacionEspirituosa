import { Component } from '@angular/core';
import {StatusService} from './providers/status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'webapp';
  status = '';
  constructor(status: StatusService) {
    status.getStatus().then(s => this.status = s);
  }
}
