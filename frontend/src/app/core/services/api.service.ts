import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)){
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // Users
  getUsers(): Observable<any> {

    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(`${this.baseUrl}/users`, {headers});
  }

  addUser(user: any): Observable<any> {

    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any[]>(`${this.baseUrl}/users/add`, {headers}, user);
  }

  updateUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/update`, user);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/delete`, {_id: userId});
  }

  // Roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`);
  }

  addRole(role: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles/add`, role);
  }

  updateRole(role: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles/update`, role);
  }

  deleteRole(roleId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles/delete`, { _id: roleId});
  }

  // Categories
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  addCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories/add`, category);
  }

  updateCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories/update`, category);
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories/delete`, { _id: categoryId});
  }
}