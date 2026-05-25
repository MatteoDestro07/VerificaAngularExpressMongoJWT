import { Component, OnInit } from '@angular/core';
import {Httpcall} from '../../services/httpcall';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-libri',
  imports: [FormsModule, CommonModule],
  templateUrl: './libri.html',
  styleUrl: './libri.css',
})
export class Libri implements OnInit {
  libri: any[] = [];
  constructor(private http:Httpcall) {  }
  loading:boolean=false;
  errorMessage: string = "";
  successMessage: string = "";
  showStats: boolean=false;
  filtroGeneri: string = "";
  showForm: boolean=false;
  isEditing: boolean=false;
  formData: any = {};
  interessiString: string = "";
  corsiString: string = "";
  statistiche: any = {};
  
  ngOnInit() {
    // All'avvio della pagina carico subito la lista completa degli studenti.
    this.loadAll();
  }

  loadAll(){
    // Resetto lo stato di errore e mostro il caricamento mentre arriva la risposta.
    this.http.getCall('/api/libri').subscribe({
      next: (res) =>{
        // Salvo il nuovo token ricevuto e aggiorno la lista in memoria.
        this.libri = res.data;
        console.log(this.libri);
      }
    });
  }

  salva(){
    this.http.postCall('/api/libri/inserisci', this.formData).subscribe({
      next: (res) => {
        this.successMessage = "Studente aggiunto con successo";
          this.loadAll();
      }
    });
  }

  annulla(){
    this.showForm=false;
    this.isEditing = false;
    this.formData = {};
    this.interessiString = '';
    this.corsiString = '';
  }

  nuovoStudente(){
    // Preparo un form vuoto per inserire un nuovo studente.
    this.isEditing = false;
    this.formData = { titolo: '', genere: '', anno: null, dettagli: { pagine: null, editore: '', annoPubblicazione: '' }, premi_vinti: [] };
    this.interessiString = '';
    this.corsiString = '';
    this.showForm = true;
  }

  cerca(){
    console.log(this.filtroGeneri)
    this.http.postCall('/api/libri/cercaPerGenere',{genere:this.filtroGeneri}).subscribe({
      next: (res) =>{
        console.log(res.data)
        this.libri = res.data
        console.log(this.libri);
        
      }
    });
  }
}
