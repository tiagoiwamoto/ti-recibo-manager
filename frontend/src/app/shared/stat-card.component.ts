import { Component, input } from '@angular/core';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NbCardModule],
  templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
  label = input('');
  value = input<string | number>('');
  helper = input('');
}
