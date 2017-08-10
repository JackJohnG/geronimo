import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';

import { WelcomeComponent } from './welcome/welcome.component';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteFormComponent } from './note-form/note-form.component';
import { MenuComponent } from './menu/menu.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsGeneralComponent } from './settings/settings-general/settings-general.component';
import { SettingsSecurityComponent } from './settings/settings-security/settings-security.component';
import { SettingsSyncComponent } from './settings/settings-sync/settings-sync.component';
import { SpinnerComponent } from "./spinner/spinner.component";

import { NotesService } from './services/notes.service';
import { GoogleApi } from './services/googleApi.service';
import { LocalStorage } from './services/localStorage.service';
import { Settings } from './services/settings.service';

import { FilterNotesByTitle } from './pipes/filterNotesByTitle.pipe';

import { MarkdownModule } from 'angular2-markdown';
import {NotesJsonComponent} from "./notes-json/notes-json.component";

@NgModule({
    declarations: [
        AppComponent,
        NoteListComponent,
        NoteFormComponent,
        MenuComponent,
        SettingsComponent,
        SettingsGeneralComponent,
        SettingsSecurityComponent,
        SettingsSyncComponent,
        WelcomeComponent,
        FilterNotesByTitle,
        SpinnerComponent,
        NotesJsonComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MarkdownModule.forRoot(),
        RouterModule.forRoot([
            {
                path: 'notes-json',
                component: NotesJsonComponent
            },
            {
                path: 'notes',
                component: NoteListComponent
            },
            {
                path: 'notes/:id',
                component: NoteListComponent
            },
            {
                path: 'note/:id',
                component: NoteFormComponent
            },
            {
                path: 'settings',
                component: SettingsComponent
            },
            {
                path: 'welcome',
                component: WelcomeComponent
            },
            { path: '',
                redirectTo: '/welcome',
                pathMatch: 'full' },
        ]),
    ],
    providers: [NotesService, GoogleApi, LocalStorage, Settings],
    bootstrap: [AppComponent]
})
export class AppModule { }
