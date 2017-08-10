import {Injectable} from '@angular/core';
import { Http, Headers } from '@angular/http';

import {LocalStorage} from "./localStorage.service";
import {MarkdownService} from "angular2-markdown";
import {GoogleApi} from "./googleApi.service";

@Injectable()
export class Settings {
    public sort;
    public password;
    public authorized: boolean;
    public clientID;
    public notesPerPage: number;
    public fontSize: number;
    public copyBtnIdentifier: string;
    static plainPassword: string = '';

    constructor(private http: Http,
                private _markdown: MarkdownService) {
        this.sort = this.getSort();
        this.clientID = this.getGoogleClientID();
        this.notesPerPage = this.getNotesPerPage();
        this.fontSize = this.getFontSize();
        this.copyBtnIdentifier = this.getCopyBtnIdentifier();
        GoogleApi.clientId = this.clientID;
    }

    savePassword(password: string): Promise<any> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Promise((resolve, reject) => {
            if(password.length !== 0) {
                this.http.get('http://localhost:3001/generate_hash/'+password, { headers: headers })
                    .subscribe((hash) => {
                        this.password = hash['_body'];
                        LocalStorage.savePassword(hash['_body']);
                        resolve();
                    });
            } else {
                this.password = password;
                LocalStorage.savePassword(password);
                resolve();
            }
        });
    }

    getPassword() {
        return LocalStorage.getPassword();
    }

    comparePasswords(password: string) {
        let creds = JSON.stringify({ password: password, hash: LocalStorage.getPassword() });
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3001/verify_password', creds, { headers: headers });
    }

    saveSort(sort: string) {
        this.sort = sort;
        LocalStorage.saveSort(sort);
    }

    getSort() {
        return LocalStorage.getSort();
    }

    saveGoogleClientID(clientID: string) {
        this.clientID = clientID;
        LocalStorage.saveGoogleClientID(clientID);
    }

    getGoogleClientID() {
        return LocalStorage.getGoogleClientID();
    }

    saveNotesPerPage(numberOfNotes: number) {
        this.notesPerPage = numberOfNotes;
        LocalStorage.saveNotesPerPage(numberOfNotes);
    }

    getNotesPerPage() {
        return LocalStorage.getNotesPerPage();
    }

    saveFontSize(fontSize: number) {
      this.fontSize = fontSize;
      LocalStorage.saveFontSize(fontSize);
    }

    getFontSize() {
      return LocalStorage.getFontSize();
    }

    saveCopyBtnIdentifier(copyBtnIdentifier: string) {
        this.copyBtnIdentifier = copyBtnIdentifier;
        LocalStorage.saveCopyBtnIdentifier(copyBtnIdentifier);
    }

    getCopyBtnIdentifier() {
        return LocalStorage.getCopyBtnIdentifier();
    }

    markdownCompile(copyBtnIdentifier: string) {
        let compile = this._markdown.compile;
        return (data: string) => {
            data = compile(data);
            if(copyBtnIdentifier.length > 0) {
                let escapedCopyBtnIdentifier =  copyBtnIdentifier.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                let regex = new RegExp(escapedCopyBtnIdentifier, 'g');
                data = data.replace(regex, '<i onclick="copyThat(event)" class="icon-copy"></i>');
            }
            data = data.replace('<a href="http', '<a target="_blank" href="http');
            return data;
        }
    }
}
