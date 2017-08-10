import { Component } from '@angular/core';
import { Router, RoutesRecognized, NavigationEnd } from '@angular/router';
import {Settings} from "../services/settings.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

    public menuWrapperOpen: boolean = false
    public menuOpen: boolean = false;
    public menuBtnTransform: boolean = false;
    public hideElement: boolean = false;

    constructor(private router: Router, private settings: Settings) {
        this.router.events.subscribe(event => {
            if (event instanceof RoutesRecognized) {
                if(event.state.root.children[0].url[0].path == 'welcome') {
                    this.hideElement = true;
                } else {
                    this.hideElement = false;
                }
            }
        });
    }

    public toggleMenu() {
        if(!this.menuWrapperOpen) {
            this.menuOpen = true;
            this.menuWrapperOpen = true;
            setTimeout(() => {
                this.menuBtnTransform = true;
            }, 250)
        } else {
            this.menuOpen = false;
            this.menuBtnTransform = false;
            setTimeout(() => {
                this.menuWrapperOpen = false;
            }, 200)
        }
    }

    public closeMenu(event: Event) {
        let element = <HTMLElement> event.target;
        if(element.classList.contains('menu__wrapper')) {
            this.menuOpen = false;
            this.menuBtnTransform = false;
            setTimeout(() => {
                this.menuWrapperOpen = false;
            }, 200)
        }
    }

    goToPage(page: string) {
        this.router.navigate([page]);
        this.menuOpen = false;
        this.menuBtnTransform = false;
        setTimeout(() => {
          this.menuWrapperOpen = false;
        }, 200)
    }
}
