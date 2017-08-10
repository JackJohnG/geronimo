import { Component } from '@angular/core';
import {Settings} from "../../services/settings.service";
import {NotesService} from "../../services/notes.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html'
})
export class SettingsSecurityComponent {

    public password: string = '';

    constructor(private settings: Settings,
                private notesService: NotesService,
                private router: Router) {
    }

    savePassword() {
        this.settings.savePassword(this.password).then(() => {
            Settings.plainPassword = this.password;
            this.notesService.updateAllNotes();
            this.router.navigate(['/welcome']);
        });
    }
}
