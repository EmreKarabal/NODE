import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthResponse {
  data: {
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private apiUrl = 'http://localhost:3000/api'; // Replace with your actual backend URL
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeUser();
  }

  private initializeUser() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(storedUser));
        } catch (error) {
          // Handle potential JSON parsing error
          this.clearUser();
        }
      }
    }
  }

  private clearUser() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
    this.currentUserSubject.next(null);
  }

  register(userData: { username: string, email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/add`, userData);
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/auth`, credentials).pipe(
      tap(response => {
        if (response && response.data && response.data.token) {
          this.setUserData(response);
          }
        else {
          console.error("Giriş başarılı ama token yok!");
        }
      })
    );
  }

  private setUserData(response: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('current_user', JSON.stringify(response));
    }
    this.currentUserSubject.next(response);
  }

  logout() {
    this.clearUser();
  }

  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) 
      ? !!localStorage.getItem('access_token')
      : false;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {

    if(isPlatformBrowser(this.platformId)){
      const token = localStorage.getItem('access_token');
      console.log("JWT TOKEN: ", token);
      return token;
    }
    return null;
  }

}