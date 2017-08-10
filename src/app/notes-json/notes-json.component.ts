import {Component, OnInit} from '@angular/core';
import {Note, NotesService} from "../services/notes.service";

@Component({
    selector: 'app-notes-json',
    templateUrl: './notes-json.component.html',
    styleUrls: ['./notes-json.component.scss']
})
export class NotesJsonComponent implements OnInit {

    public notes = [];

    constructor(private notesService: NotesService) {

    }

    ngOnInit() {
        if(NotesService.initialized) {
            this.notes = this.notesService.fetch();
        } else {
            this.notesService.init().then((notes: Array<Note>) => {
                NotesService.initialized = true;
                for(let note of notes) {
                    this.notes.push(<Note> note);
                }
            });
        }
    }
}
