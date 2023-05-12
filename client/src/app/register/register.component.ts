import { Component, EventEmitter, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Output() cancelRegister = new EventEmitter<boolean>();
   model: any = {}

   constructor(private accountService: AccountService){}

   ngOnInit(){

   }

   register(): void {
      this.accountService.register(this.model).subscribe({
        next: () => {
          this.cancel();
        },
        error: error => {
          console.log(error)
        }
      })
   }

   cancel(): void {
     this.cancelRegister.emit(false);
   }
}
