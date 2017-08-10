import { Component, AfterViewInit } from '@angular/core';
import {Settings} from "../../services/settings.service";

declare let $: any;

@Component({
  selector: 'app-settings-general',
  templateUrl: './settings-general.component.html'
})
export class SettingsGeneralComponent implements AfterViewInit{

    public sort: string;
    public notesPerPage: string;
    public fontSize: string;
    public copyBtnIdentifier: string;

    constructor(private settings: Settings) {
        this.sort = this.settings.getSort();
        this.notesPerPage = this.settings.getNotesPerPage().toString();
        this.fontSize = this.settings.getFontSize().toString();
        this.copyBtnIdentifier = this.settings.getCopyBtnIdentifier();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            $('select').select2({
                minimumResultsForSearch: Infinity
            });
            $('select').on("select2:select", (event: any) => {
                this.saveSort(event);
            });
            $('[data-toggle="tooltip"]').tooltip()
        }, 0)
    }

    saveSort(event: any) {
        this.sort = event.target.value;
        this.settings.saveSort(this.sort);
    }

    saveNotesPerPage() {
        this.settings.saveNotesPerPage(parseInt(this.notesPerPage));
    }

    saveInputFontSize() {
      this.settings.saveFontSize(parseInt(this.fontSize));
    }

    saveCopyBtnIdentifier() {
        this.settings.saveCopyBtnIdentifier(this.copyBtnIdentifier);
    }
}
