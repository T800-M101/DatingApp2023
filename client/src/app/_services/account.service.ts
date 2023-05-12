import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, map } from 'rxjs';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = 'https://localhost:5001/api/';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  

  constructor(private http: HttpClient) { }

  login(model: any) {
      return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
        map((response: User) => {
           const user = response;
           if (user) {
             localStorage.setItem('user', JSON.stringify(user));
             this.currentUserSource.next(user); // when logged in the service emits the state of  user to all components subscribed 
           }
        })
      )
  }

  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      })
    )
  }

  // when reloads a component gets from localStorage the user token and emits the state of it
  setCurrentUser(user: User): void {
    this.currentUserSource.next(user);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);

  }
}
