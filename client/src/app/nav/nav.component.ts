import { Component } from '@angular/core';
import { AccountService } from '../_services/account.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  model: any = {};
  user: any;
  

  constructor(public accountService: AccountService){}

  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: response => {
        this.user = response?.username;
      }
    })
  }

 

  login(){
    this.accountService.login(this.model).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error: any) => {
        console.log(error.error)
      }
    })
  }

  logout(): void {
    this.accountService.logout();
  }



}
