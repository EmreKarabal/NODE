import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "http://localhost:3000/api";

  constructor(private http:HttpClient, private router:Router) { }

  register(user: { name: string, email:string, password: string}) {

    return this.http.post(`${this.apiUrl}/users/add`, user);
  }

  login(credentials: { email: string, password: string}) {
    return this.http.post(`${this.apiUrl}/users/auth`, credentials);  
  }

  // get all users
  getProfiles(){
    return this.http.get(`${this.apiUrl}/users`)
  }


}
