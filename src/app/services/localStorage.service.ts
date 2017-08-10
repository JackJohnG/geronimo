import {Injectable} from '@angular/core';
import {Note} from "./notes.service";
import {Settings} from "./settings.service";

declare let window: Window;
declare let CryptoJS: any;

@Injectable()
export class LocalStorage {

    static saveNotes(notes: Array<Note>) {
        let data = JSON.stringify(notes);
        if(Settings.plainPassword.length !== 0) {
            data = CryptoJS.AES.encrypt(data, Settings.plainPassword).toString();
        }
        window.localStorage.setItem('notes', data);
        window.localStorage.setItem('counter', Note.counter.toString());
    }

    static getNotes() {
        let notes = [];
        let localStorageNotes = window.localStorage.getItem('notes');
        if(localStorageNotes !== null) {
            if(Settings.plainPassword.length !== 0) {
                notes = JSON.parse(CryptoJS.AES.decrypt(localStorageNotes, Settings.plainPassword).toString(CryptoJS.enc.Utf8));
                console.log(notes);
            } else {
                notes = JSON.parse(localStorageNotes);
            }
        }
        return {
            notes: notes,
            counter: window.localStorage.getItem('counter') == null ? 0 : parseInt(window.localStorage.getItem('counter'))
        }
    }

    static savePassword(password: string) {
        window.localStorage.setItem('password', password);
    }

    static getPassword(): string {
        return (window.localStorage.getItem('password') == null ? '' : window.localStorage.getItem('password'));
    }

    static saveSort(sort: string) {
        window.localStorage.setItem('sort', sort);
    }

    static getSort(): string {
        return (window.localStorage.getItem('sort') == null ? 'title_a_z' : window.localStorage.getItem('sort'));
    }

    static saveGoogleClientID(clientID: string) {
        window.localStorage.setItem('googleClientID', clientID);
    }

    static getGoogleClientID() {
        return (window.localStorage.getItem('googleClientID') == null ? '' : window.localStorage.getItem('googleClientID'));
    }

    static saveNotesPerPage(numberOfNotes: number) {
        window.localStorage.setItem('notesPerPage', numberOfNotes.toString());
    }

    static getNotesPerPage() {
        return (window.localStorage.getItem('notesPerPage') == null ? -1 : parseInt(window.localStorage.getItem('notesPerPage')));
    }

    static saveFontSize(fontSize: number) {
        window.localStorage.setItem('fontSize', fontSize.toString());
    }

    static getFontSize() {
        return (window.localStorage.getItem('fontSize') == null ? 18 : parseInt(window.localStorage.getItem('fontSize')));
    }

    static saveCopyBtnIdentifier(copyBtnIdentifier: string) {
        window.localStorage.setItem('copyBtnIdentifier', copyBtnIdentifier);
    }

    static getCopyBtnIdentifier() {
        return (window.localStorage.getItem('copyBtnIdentifier') == null ? '' : window.localStorage.getItem('copyBtnIdentifier'));
    }
}
