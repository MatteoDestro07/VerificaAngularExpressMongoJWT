import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Libri } from "./pages/libri/libri";

@Component({
  selector: 'app-root',
  imports:[ Libri],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client');
}
