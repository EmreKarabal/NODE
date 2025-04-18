import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { last, Observable } from 'rxjs';
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
  getUsers(page:number = 1, perPage: number = 2): Observable<any> {
    
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    

    const params = new HttpParams()
    .set('page', page.toString())
    .set('per_page', perPage.toString());

    return this.http.get<any[]>(`${this.baseUrl}/users`, {
      headers: headers,
      params: params
  });
  }

  getCustomers(): Observable<any>{
    return this.http.get<any[]>(`${this.baseUrl}/customers`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post<any[]>(`${this.baseUrl}/users/add`, user);
  }

  addCustomer(customer: any): Observable<any> {
    return this.http.post<any[]>(`${this.baseUrl}/customers/add`, customer);
  }

  updateUser(user: any): Observable<any> {
    console.log("updateding this user: ", user);
    return this.http.post(`${this.baseUrl}/users/update`, user);
  }

  updateCustomer(customer: any): Observable<any>{
    console.log('Updating this customer: ', customer);
    return this.http.post(`${this.baseUrl}/customers/update`, customer);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/delete`, {_id: userId});
  }

  deleteCustomer(customerId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers/delete`, { _id: customerId });
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

  // Statistics
  getUserStatistics(){
    return this.http.get<{
      dailyUsers: {dates: string[], counts: number[] }, 
      activeUsers: {dates:string[], counts:number[] },
      userRoles: {labels: string[], counts: number[] }
    }>(`${this.baseUrl}/statistics`);
  }

  getCustomerById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/customers/${id}`);
  }

  
  validateCustomerAccess(customerId: string, userId: string) {
    return this.http.post<any>(`${this.baseUrl}/customers/validate-access`, {
      customerId,
      userId
    });
  }

  sendChatMessage(customPrompt: string,message: string) {
    return this.http.post<any>(`${this.baseUrl}/chat/message`, {
      customPrompt,
      message
    });
  }

}