import { Component, ViewChild, ElementRef } from '@angular/core';
import {Settings} from "../../services/settings.service";

declare let $: any;

@Component({
  selector: 'app-settings-sync',
  templateUrl: './settings-sync.component.html',
  styleUrls: ['./settings-sync.component.scss']
})
export class SettingsSyncComponent {

  public clientID: string = '';
  public showInstructions: boolean = false;

  @ViewChild('instructions') instructions: ElementRef;

  constructor(private settings: Settings) {
      this.clientID = this.settings.clientID;
  }

  toggleInstructions() {
      this.showInstructions = !this.showInstructions;
      $(this.instructions.nativeElement).slideToggle('slow');
  }

  saveGoogleClientID() {
      this.settings.saveGoogleClientID(this.clientID);
  }
}
