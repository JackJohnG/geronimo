import {Injectable} from '@angular/core';

import {Note} from './notes.service';
import {Settings} from "app/services/settings.service";

let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
let SCOPES = 'https://www.googleapis.com/auth/drive';

declare let window: any;
declare let CryptoJS: any;

@Injectable()
export class GoogleApi {

    static fileId = null;
    static clientId = null;

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    static handleClientLoad(readData: boolean, writeData: boolean, notes: Array<Note>) {
        return new Promise((resolve, reject) => {
            if(GoogleApi.clientId !== null) {
                window.gapi.load('client:auth2', () => {
                    resolve(GoogleApi.initClient(readData, writeData, notes));
                });
            } else {
                reject();
            }
        })
    }

    /**
     * tries to sign in user
     */
    static initClient(readData: boolean, writeData: boolean, notes: Array<Note>) {
        return window.gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: GoogleApi.clientId,
            scope: SCOPES
        }).then(() => {
            if(readData) {
                return GoogleApi.listFiles(window.gapi.auth2.getAuthInstance().isSignedIn.get());
            } else {
                return GoogleApi.uploadFile(window.gapi.auth2.getAuthInstance().isSignedIn.get(), notes);
            }
        });
    }

    /**
     *  Sign in the user and call to print files on success
     */
    static handleAuthClick(readData: boolean, writeData: boolean, notes?: Array<Note>) {
        return window.gapi.auth2.getAuthInstance().signIn().then(() => {
            if(readData) {
                return GoogleApi.listFiles(true);
            } else {
                return GoogleApi.uploadFile(true, notes);
            }
        }, () => {return 'no permission';});
    }

    /**
     * Print files. If unsuccessful, then it sign in the user first
     */
    static listFiles(param) {
        let arr = [];
        return window.gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)"
        }).then((response) => {
            let files = response.result.files;
            if (files && files.length > 0) {
              for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if(file.name == 'Geronimo(note-keeper).json') {
                    GoogleApi.fileId = file.id;
                    return GoogleApi.downloadFile(file);
                }
                arr.push(file.name + ' (' + file.id + ')');
              }
            } else {
              arr.push('No files found.');
            }
            return 'error';
        }, err => {
            return GoogleApi.handleAuthClick(true, false);
        });
    }

    static uploadFile(param, notes) {
        window.gapi.client.load('drive', 'v2', () => {
            GoogleApi.insertFile(notes);
        });
    }

    /**
     * Insert new file.
     */
    static insertFile(notes) {
        let path = '/upload/drive/v2/files';
        let method = 'POST';
        if(GoogleApi.fileId != null) {
            path = '/upload/drive/v2/files/'+GoogleApi.fileId;
            method = 'PUT';
        }
        let data = JSON.stringify({
            notes: notes,
            counter: Note.counter
        });
        if(Settings.plainPassword.length !== 0) {
            data = CryptoJS.AES.encrypt(data, Settings.plainPassword).toString();
        }
        let boundary = '-------314159265358979323846264';
        let delimiter = "\r\n--" + boundary + "\r\n";
        let close_delim = "\r\n--" + boundary + "--";
        let fileName = 'Geronimo(note-keeper).json';
        let contentType = 'application/json';
        let metadata = {
            'title': fileName,
            'mimeType': contentType
        };
        let base64Data = btoa(window.unescape(encodeURIComponent(data)));
        let multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;
        let request = window.gapi.client.request({
            'path': path,
            'method': method,
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        request.execute((response) => {
            if(response.error) {
                GoogleApi.handleAuthClick(false, true, notes);
            }

        });
    }

    static downloadFile(file) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let accessToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
            xhr.open('GET', 'https://www.googleapis.com/drive/v3/files/'+file.id+'?alt=media');
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.onload = function() {
                let data = xhr.responseText;
                if(Settings.plainPassword.length !== 0) {
                    if(GoogleApi.isJsonString(data)) {
                        GoogleApi.uploadFile(true, JSON.parse(data));
                    } else {
                        data = CryptoJS.AES.decrypt(data, Settings.plainPassword).toString(CryptoJS.enc.Utf8);
                    }
                }
                resolve(data);
            };
            xhr.onerror = function(err) {
                reject(err);
            };
            xhr.send();
        });
    }

    static checkInternetConnection() {
      new Promise((resolve, reject) => {
        resolve();
      });
    }

    static isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
}
