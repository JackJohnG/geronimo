import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import {Settings} from "../services/settings.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements AfterViewInit {

  public password: string = '';
  public shake: boolean = false;
  public passwordIsChecking: boolean = false;
  @ViewChild('passwordInput') passwordInput: ElementRef

  constructor(private settings: Settings, private router: Router) {
      if(this.settings.getPassword().length == 0) {
          this.router.navigate(['/notes']);
      }
  }

  comparePasswords() {
    this.passwordIsChecking = true;
    this.settings.comparePasswords(this.password).subscribe((result) => {
        this.passwordIsChecking = false;
        if(result['_body'] == 'match') {
            this.settings.authorized = true;
            Settings.plainPassword = this.password;
            this.router.navigate(['/notes']);
        } else {
            this.shake = true;
            setTimeout(() => {
                this.shake = false;
            }, 500);
        }
    }, (err) => {
        this.passwordIsChecking = false;
        this.shake = true;
        setTimeout(() => {
          this.shake = false;
        }, 500);
    });
  }

  ngAfterViewInit() {
      this.passwordInput.nativeElement.focus();
  }
}
