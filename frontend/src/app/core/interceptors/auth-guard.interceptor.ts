import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';


@Injectable()
export class AuthGuardInterceptor implements HttpInterceptor {
  
  constructor (private router: Router) {}
  
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 402) {
          alert('Bu işlemi yapmak için yeterli yetkiniz yok.');
          this.router.navigate(['/dashboard']);
        }

        return throwError(error);

      })
    ) 
  }

}