import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api'; // Replace with your actual backend URL

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  updateUser(userId: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, user);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  // Roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`);
  }

  addRole(role: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles`, role);
  }

  updateRole(roleId: string, role: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/roles/${roleId}`, role);
  }

  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/${roleId}`);
  }

  // Categories
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  addCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, category);
  }

  updateCategory(categoryId: string, category: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/categories/${categoryId}`, category);
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/${categoryId}`);
  }
}