import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

    public currentTab = 'general';

    constructor() {
    }

    changeCurrentTab(tabName: string) {
        this.currentTab = tabName;
    }
}
