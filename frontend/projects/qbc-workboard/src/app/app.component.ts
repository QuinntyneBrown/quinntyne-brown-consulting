import { Component } from '@angular/core';
import { AppShellComponent } from './shell/app-shell.component';
import { StoryEditorComponent } from './features/stories/story-editor.component';

@Component({
  selector: 'app-root',
  imports: [AppShellComponent, StoryEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}

