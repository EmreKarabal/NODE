import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService:AuthService, private router: Router) {

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(){

    console.log("Button clicked! Processing Registiration");

    if(this.registerForm.valid){

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log("Succesfully Registered", response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error("Registiration failed!!", error);
        }

      })

    }

  }


}
