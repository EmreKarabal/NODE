import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor (private fb: FormBuilder, private authService: AuthService, private router: Router) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(){

    console.log("Button clicked! Processing Login");

    if (this.loginForm.valid){
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Successful Login!', response);
          this.router.navigate(["/home"]);
        },
        error: (error) => {
          console.error("Failure during login!", error);
        }
      });

    }

  }


}
