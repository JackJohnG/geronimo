import {Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute } from '@angular/router';

import {Note, NotesService} from '../services/notes.service';
import {Settings} from "../services/settings.service";
import {SpinnerComponent} from "../spinner/spinner.component";
import {MarkdownService} from "angular2-markdown";

@Component({
    selector: 'app-note-list',
    templateUrl: './note-list.component.html',
    styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent implements OnInit, AfterViewInit {

    public notes: Array<Note> = new Array<Note>();
    public currentNote = new Note();
    public searchNotes: boolean = false;
    public noteTitleToSearch: string = '';
    public currentNotesPage: number = 0;
    public currentNotes = new Array<Note>();
    public viewInited: boolean = false;
    public allTags = [];
    public activeTags = [];

    private copyBtnIdentifier: string;

    @ViewChild('noteTitleToSearchInput') noteTitleToSearchInput: ElementRef;
    @ViewChild('spinner') spinner: SpinnerComponent;

    constructor(private notesService: NotesService,
                private router: Router,
                private route: ActivatedRoute,
                public settings: Settings,
                private _markdown: MarkdownService) {

        this.copyBtnIdentifier = this.settings.getCopyBtnIdentifier();
    }

    ngOnInit() {
        let id = parseInt(this.route.snapshot.params['id']);
        if(NotesService.initialized) {
            this.notes = this.notesService.fetch();
            this.sortNotes();
            if(this.notes.length > 0) {
                let currentNoteDefined = false;
                for(let note of this.notes) {
                    if(note.tags) {
                        for(let tag of note.tags) {
                            if(this.allTags.indexOf(tag) === -1) {
                                this.allTags.push(tag);
                            }
                        }
                    }
                    if(!isNaN(id) && note.id == id) {
                        currentNoteDefined = true;
                        this.currentNote = note;
                    }
                }
                if(!currentNoteDefined) {
                    this.currentNote = this.notes[0];
                }
            }
            this.spinner.hide();
        } else {
            this.notesService.init().then((notes: Array<Note>) => {
                NotesService.initialized = true;
                for(let note of notes) {
                    this.notes.push(<Note> note);
                }
                this.sortNotes();
                if(this.notes.length > 0) {
                    let currentNoteDefined = false;
                    for(let note of this.notes) {
                        if(note.tags) {
                            for(let tag of note.tags) {
                                if(this.allTags.indexOf(tag) === -1) {
                                    this.allTags.push(tag);
                                }
                            }
                        }
                        if(!isNaN(id) && note.id == id) {
                            currentNoteDefined = true;
                            this.currentNote = note;
                        }
                    }
                    if(!currentNoteDefined) {
                        this.currentNote = this.notes[0];
                    }
                }
                this.spinner.hide();
            });
        }

        this._markdown.compile = this.settings.markdownCompile(this.copyBtnIdentifier);
    }

    ngAfterViewInit() {
        this.viewInited = true;
    }

    switchCurrentNote(note: Note) {
        this.currentNote = note;
    }

    newNote() {
        this.router.navigate(['/note', -1]);
    }

    editNote() {
        this.router.navigate(['/note', this.currentNote.id]);
    }

    deleteNote() {
        let tags = this.currentNote.tags;
        if(this.notesService.remove(this.currentNote.id)) {
            if(tags) {
                for(let tag of tags) {
                    if(this.allTags.indexOf(tag) !== -1) {
                        this.allTags.splice(this.allTags.indexOf(tag), 1);
                    }
                    if(this.activeTags.indexOf(tag) !== -1) {
                        this.activeTags.splice(this.activeTags.indexOf(tag), 1);
                    }
                }
            }
            for(let index=0; index<this.notes.length; index++) {
                if(this.notes[index].id == this.currentNote.id) {
                    if((index-1) != -1) {
                        this.currentNote = this.notes[index-1];
                        break;
                    } else if((index+1) != this.notes.length) {
                        this.currentNote = this.notes[index+1];
                        break;
                    } else {
                        this.currentNote = new Note();
                        break;

                    }
                }
            }
            this.notes = this.notesService.fetch();
            this.sortNotes();
        }
    }

    sortNotes() {
        if(this.settings.sort.indexOf('title') != -1) {
            let sortedNotes = new Array<Note>();
            for(let note of this.notes) {
                let index = 0;
                for(let sortedNote of sortedNotes) {
                    if(this.settings.sort == 'title_a_z') {
                        if (note.title > sortedNote.title) {
                            index++;
                        } else {
                            break;
                        }
                    } else if(this.settings.sort == 'title_z_a') {
                        if (note.title < sortedNote.title) {
                            index++;
                        } else {
                            break;
                        }
                    }
                }
                sortedNotes.splice(index, 0, note);
            }
            this.notes = sortedNotes;
        } else if(this.settings.sort.indexOf('date') != -1) {
            let sortedNotes = new Array<Note>();
            for(let note of this.notes) {
                let index = 0;
                for(let sortedNote of sortedNotes) {
                    if(this.settings.sort == 'date_created') {
                        if(new Date(note.dateCreated).getTime() < new Date(sortedNote.dateCreated).getTime()) {
                            index++;
                        } else {
                            break;
                        }
                    } else if(this.settings.sort == 'date_modified') {
                        if (new Date(note.dateModified).getTime() < new Date(sortedNote.dateModified).getTime()) {
                            index++;
                        } else {
                            break;
                        }
                    }
                }
                sortedNotes.splice(index, 0, note);
            }
            this.notes = sortedNotes;
        }
        this.sortFavouriteNotes();
        this.showCurrentNotesPage();
    }

    sortFavouriteNotes() {
        let favouriteNotes = new Array<Note>();
        let notFavouriteNotes = new Array<Note>();
        for(let note of this.notes) {
            if(note.isFavourite) {
                favouriteNotes.push(note);
            } else {
                notFavouriteNotes.push(note);
            }
        }
        this.notes = favouriteNotes;
        this.notes = this.notes.concat(notFavouriteNotes);
    }

    filterByTags(note: Note) {
        if(note.tags) {
            for(let tag of note.tags) {
                if(this.activeTags.indexOf(tag) !== -1) {
                    return true;
                }
            }
        }
        return false
    }

    showCurrentNotesPage() {
        if(this.settings.notesPerPage != -1 && this.settings.notesPerPage < this.notes.length) {
            let start = this.currentNotesPage*this.settings.notesPerPage;
            this.currentNotes = this.notes.slice(start, start+this.settings.notesPerPage);
        } else {
            this.currentNotes = this.notes;
        }
    }

    nextNotesPage() {
        if((this.currentNotesPage*this.settings.notesPerPage)+this.settings.notesPerPage < this.notes.length) {
            this.currentNotesPage++;
            this.showCurrentNotesPage();
        }
    }

    prevNotesPage() {
        if(this.currentNotesPage >= 1) {
            this.currentNotesPage--;
            this.showCurrentNotesPage();
        }
    }

    switchNotesPage(event) {
        if(event.wheelDelta < 0) {
            this.nextNotesPage();
        } else {
            this.prevNotesPage();
        }
    }

    openSearchNoteTilteField() {
        this.searchNotes = true;
        setTimeout(() => {
            this.noteTitleToSearchInput.nativeElement.focus();
        }, 250);
    }

    closeSearchNoteTitleField() {
        setTimeout(() => {
            this.searchNotes = false;
            this.noteTitleToSearch = '';
        }, 0);
    }

    toggleFavourite(note) {
        note.isFavourite = !note.isFavourite;
        this.sortNotes();
        this.notesService.update(note, true);
    }

    toggleTag(tag) {
        if(this.activeTags.indexOf(tag) === -1) {
            this.activeTags.push(tag)
        } else {
            this.activeTags.splice(this.activeTags.indexOf(tag), 1);
        }
    }
}
