import {Injectable} from '@angular/core';
import {GoogleApi} from "./googleApi.service";
import {LocalStorage} from "./localStorage.service";

export class Note {
  id: number;
  title: string = '';
  text: string = '';
  dateCreated: Date = new Date();
  dateModified: Date = new Date();
  isFavourite: boolean = false;
  tags = [];

  static counter: number = 0;

  constructor() {
      this.id = Note.counter;
  }
}

@Injectable()
export class NotesService {

    private notes = new Array<Note>();

    static initialized = false;
    static useGoogleAPI = false;

    constructor() {
    }

    init() {
        return new Promise((resolve, reject) => {
            if(LocalStorage.getGoogleClientID().length === 0) {
                NotesService.useGoogleAPI = false;
                let data = LocalStorage.getNotes();
                this.notes = data.notes;
                Note.counter = data.counter;
                resolve(this.notes);
            } else {
                return this.checkInternetConnection().then(() => {
                    return GoogleApi.handleClientLoad(true, false, null).then((jsonNotes: string) => {
                        if(jsonNotes.indexOf('no permission') == -1 && jsonNotes.indexOf('error') == -1) {
                            let data = JSON.parse(jsonNotes);
                            this.notes = data.notes;
                            Note.counter = data.counter;
                            NotesService.useGoogleAPI = true;
                            LocalStorage.saveNotes(this.notes);
                        } else {
                            let data = LocalStorage.getNotes();
                            this.notes = data.notes;
                            Note.counter = data.counter;
                            NotesService.useGoogleAPI = false;
                            GoogleApi.handleClientLoad(false, true, this.notes);
                        }
                        resolve(this.notes);
                    });
                }, () => {
                    NotesService.useGoogleAPI = false;
                    let data = LocalStorage.getNotes();
                    this.notes = data.notes;
                    Note.counter = data.counter;
                    resolve(this.notes);
                });
            }
        })
    }

    private validate(note: Note): boolean {
        let valid = true;
        if(!note.title || note.title.length == 0) {
            valid = false;
        }
        if(!note.text || note.text.length == 0) {
            valid = false;
        }
        return valid;
    }

    add(note: Note) {
        if(!this.validate(note)) {
            return false;
        }
        note.dateCreated = new Date();
        note.dateModified = new Date();
        this.notes.push(note);
        Note.counter++;
        this.checkInternetConnection().then(() => {
            if(NotesService.useGoogleAPI) {
                GoogleApi.handleClientLoad(false, true, this.notes);
            }
            LocalStorage.saveNotes(this.notes);
        }, () => {
            LocalStorage.saveNotes(this.notes);
        });
        return true;
    }

    remove(noteId: number) {
        for(let note of this.notes) {
            if(note.id == noteId) {
                this.notes.splice(this.notes.indexOf(note), 1);
                this.checkInternetConnection().then(() => {
                    if(NotesService.useGoogleAPI)
                        GoogleApi.handleClientLoad(false, true, this.notes);
                    LocalStorage.saveNotes(this.notes);
                }, () => {
                    LocalStorage.saveNotes(this.notes);
                });
                return true;
            }
        }
        return false;
    }

    update(noteToUpdate: Note, notUpdate?: boolean) {
      for(let note of this.notes) {
          if(note.id == noteToUpdate.id) {
              if(!notUpdate) {
                  noteToUpdate.dateModified = new Date();
              }
              note = noteToUpdate;
              this.checkInternetConnection().then(() => {
                  if(NotesService.useGoogleAPI)
                      GoogleApi.handleClientLoad(false, true, this.notes);
                  LocalStorage.saveNotes(this.notes);
              }, () => {
                  LocalStorage.saveNotes(this.notes);
              });
              return true;
          }
      }
      return false;
    }

    updateAllNotes() {
        this.checkInternetConnection().then(() => {
            if(NotesService.useGoogleAPI)
                GoogleApi.handleClientLoad(false, true, this.notes);
            LocalStorage.saveNotes(this.notes);
        }, () => {
            LocalStorage.saveNotes(this.notes);
        });
    }

    fetch() {
        return this.notes;
    }

    checkInternetConnection() {
      return new Promise((resolve, reject) => {
          // var xhr = new XMLHttpRequest();
          // xhr.open('GET', 'http://www.example.com/');
          // xhr.onload = function() {
          //     console.log('connected');
          //     resolve();
          // };
          // xhr.onerror = function(err) {
          //     console.log('disconnected');
          //     reject();
          // };
          // xhr.send();
          resolve();
      });
    }

}
