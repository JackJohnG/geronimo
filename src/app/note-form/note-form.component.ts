import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Note, NotesService } from '../services/notes.service';
import {Settings} from "../services/settings.service";
import {MarkdownComponent, MarkdownService} from "angular2-markdown";

declare let $: any;

@Component({
    selector: 'app-note-form',
    templateUrl: './note-form.component.html',
    styleUrls: ['./note-form.component.scss']
})
export class NoteFormComponent implements OnInit, AfterViewInit {

    public editMode = false;

    public note = new Note();
    public backupNote = new Note();
    public fontSize: string;
    public formSubmitted: boolean = false;
    public copyBtnIdentifier: string;
    public tagInput = '';
    public allTags = [];
    public suggestedTags = [];
    public selectedTagSuggestion = null;

    @ViewChild('noteTextArea') noteTextArea: ElementRef;
    @ViewChild('topElementsWrapper') topElementsWrapper: ElementRef;

    constructor(private notesService: NotesService,
                private router: Router,
                private route: ActivatedRoute,
                private settings: Settings,
                private _markdown: MarkdownService) {
        this.fontSize = this.settings.getFontSize()+'px';
        this.copyBtnIdentifier = this.settings.getCopyBtnIdentifier();
    }

    ngOnInit() {
        let id = parseInt(this.route.snapshot.params['id']);
        for(let note of this.notesService.fetch()) {
            if(note.tags) {
                for(let tag of note.tags) {
                    if(this.allTags.indexOf(tag) === -1) {
                        this.allTags.push(tag);
                    }
                }
            }
            if(id !== -1 && note.id == id) {
                this.note = note;
                this.backupNote.text = this.note.text;
                this.backupNote.title = this.note.title;
                this.editMode = true;
                if(!note.tags) {
                    this.note.tags = [];
                }
            }
        }

        this._markdown.compile = this.settings.markdownCompile(this.copyBtnIdentifier);
    }

    ngAfterViewInit() {
        this.noteTextArea.nativeElement.style.height = window.innerHeight - this.topElementsWrapper.nativeElement.offsetHeight + 'px';
        document.getElementById("titleInput").focus();
        window.addEventListener('keypress', (event) => {
            if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
            this.saveNote();
            event.preventDefault();
            return false;
        });

        $('#tagsModal').on('shown.bs.modal', function () {
            $('#tagsModal input').focus()
        })
    }

    tabIndent(event: any) {
        if (event.keyCode !== 9) return;
        let Z;
        let S = event.target.selectionStart;
        let E = Z = event.target.selectionEnd;
        let A = event.target.value.slice(S, E);
        A = A.split('\n');
        if (!event.shiftKey) {
            for (let x in A) {
                A[x] = '\t' + A[x];
                Z++;
            }
        } else {
            for (let x in A) {
                console.log(A[x][0] == '\t');
                if (A[x][0] == '\t') A[x] = A[x].substr(1);
                Z--;
            }
        }
        A = A.join('\n');
        event.target.value = event.target.value.slice(0, S) + A + event.target.value.slice(E);
        event.target.selectionStart = S != E ? S : Z;;
        event.target.selectionEnd = Z;
        event.preventDefault();
    }

    deleteNote() {
        if(this.notesService.remove(this.note.id)) {
            this.router.navigate(['/notes']);
        }
    }

    saveNote() {
        this.formSubmitted = true;
        if(this.editMode) {
            if(this.notesService.update(this.note)) {
                this.router.navigate(['/notes', this.note.id]);
            }
        } else {
            if(this.notesService.add(this.note)) {
                this.router.navigate(['/notes', this.note.id]);
            }
        }
    }

    cancelNote() {
        this.note.text = this.backupNote.text;
        this.note.title = this.backupNote.title;
        if(this.editMode) {
            this.router.navigate(['/notes', this.note.id]);
        } else {
            this.router.navigate(['/notes']);
        }
    }

    addTag(event) {
        if(event.keyCode == 13) {
            if(this.selectedTagSuggestion) {
                this.note.tags.push(this.selectedTagSuggestion);
            } else {
                if(this.note.tags.indexOf(this.tagInput) === -1) {
                    this.note.tags.push(this.tagInput);
                }
            }
            this.tagInput = '';
            this.selectedTagSuggestion = null;
            this.suggestedTags = [];
        } else {
            this.suggestedTags = [];
            if(event.keyCode !== 40 && event.keyCode !== 38) {
                this.selectedTagSuggestion = null;
            }
            if(this.tagInput.length !== 0) {
                for(let tag of this.allTags) {
                    if(tag.indexOf(this.tagInput) === 0 && this.suggestedTags.length <= 3 && this.note.tags.indexOf(tag) === -1) {
                        this.suggestedTags.push(tag);
                    }
                }
            }
        }
    }

    addSuggestedTag(tag) {
        let index = this.note.tags.indexOf(tag);
        if(index == -1 || this.note.tags[index].length !== tag.length) {
            this.note.tags.push(tag);
            this.tagInput = '';
            this.suggestedTags = [];
        }
    }

    removeTag(tag: string) {
        this.note.tags.splice(this.note.tags.indexOf(tag), 1);
    }

    clearSuggestedTags() {
        this.suggestedTags = [];
        this.selectedTagSuggestion = null;
    }

    selectTagSuggestion(down: boolean) {
        let index = this.selectedTagSuggestion ? this.suggestedTags.indexOf(this.selectedTagSuggestion) : -1;
        if(down) {
            if(index === -1) {
                if(this.suggestedTags.length !== 0) {
                    this.selectedTagSuggestion = this.suggestedTags[0];
                }
            } else {
                if(index !== this.suggestedTags.length-1) {
                    this.selectedTagSuggestion = this.suggestedTags[++index];
                } else {
                    this.selectedTagSuggestion = this.suggestedTags[0];
                }
            }
        } else {
            if(index === -1) {
                if(this.suggestedTags.length !== 0) {
                    this.selectedTagSuggestion = this.suggestedTags[this.suggestedTags.length-1];
                }
            } else {
                if(index !== 0) {
                    this.selectedTagSuggestion = this.suggestedTags[--index];
                } else {
                    this.selectedTagSuggestion = this.suggestedTags[this.suggestedTags.length-1];
                }
            }
        }
    }
}
