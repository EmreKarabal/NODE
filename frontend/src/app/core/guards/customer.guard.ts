import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { catchError, Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class CustomerGuard implements CanActivate{
  
  constructor (
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}
  
    
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> {
    const customerId = route.params['customerId'];
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && this.authService.hasRole(currentUser, 'admin')) {
      return true;
    }

    return this.apiService.validateCustomerAccess(customerId, currentUser?._id).pipe(
      map(response => {
        if (response && response.valid){
          return true;
        }

        this.router.navigate(['/login']);
        return false;
      }),
      catchError(error => {
        console.error('Error validating customer access: ', error);
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
  
}
