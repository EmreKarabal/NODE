import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service'; // Ensure this import

// Keep existing interfaces
interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  is_active: boolean;
  language: string;
  roles?: Array<{
    role_id: {
      _id: string;
      role_name: string;
      is_active: boolean;
    }
  }>;
}

interface Role {
  _id: string;
  role_name: string;
  is_active: boolean;
  permissions?: Permission[];
}

interface Permission {
  _id: string;
  role_id: string;
  permission: string;
}

interface Category {
  _id: string;
  name: string;
  is_active: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {
  // Mevcut özellikler
  activeTab: 'users' | 'roles' | 'categories' = 'users';
  users: User[] = [];
  roles: Role[] = [];
  categories: Category[] = [];
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  currentEntity: any = {};

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Sadece veri yükleme
    this.loadData();
  }

  switchTab(tab: 'users' | 'roles' | 'categories') {
    this.activeTab = tab;
    this.loadData();
  }

  openModal(mode: 'add' | 'edit', entity?: any, event?: Event) {
    console.log('modal çalıştı');

    if(event){
      event.stopPropagation();
    }

    this.modalMode = mode;
    this.isModalOpen = true;
    this.currentEntity = mode === 'edit' ? { ...entity } : {};
  }

  closeModal(event?: Event){

    if(event) {
      if(event.target === event.currentTarget){
        console.log('modal kapandı 1');
        this.isModalOpen = false;
        this.currentEntity = {};
      }
    } else {
      console.log('modal kapandı 2');
      this.isModalOpen = false;
      this.currentEntity = {};
    }

    
  }

  saveEntity(type: string) {
    // Backend izin kontrolüne güven
    switch(this.activeTab){
      case 'users':
        if(this.modalMode === 'add'){
          this.apiService.addUser(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.closeModal();
            },
            error => console.error('Error while adding user! ', error)
          );
        } else {
          this.apiService.updateUser(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.closeModal();
            },
            error => console.error('Error while editing user! ', error)
          );
        }
        break;
      
      case 'roles':
        if(this.modalMode === 'add'){
          this.apiService.addRole(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.closeModal();
            },
            error => console.error('Error while adding role! ', error)
          );
        } else {
          this.apiService.updateRole(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.closeModal();
            },
            error => console.error('Error while updating role! ', error)
          );
        }
        break;

      case 'categories':
        if(this.modalMode === 'add'){
          this.apiService.addCategory(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.closeModal();
            },
            error => console.error('Error while adding category! ', error)
            
          );
        } else {
          this.apiService.updateCategory(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.closeModal();
            },
            error => console.error('Error while updating category! ', error)
          );
        }
        break;
    }
  }

  deleteEntity(type: string, id: string) {
    // Backend izin kontrolüne güven
    if(!confirm('Are you sure you want to delete this item?')) return;

    switch(type) {
      case 'users':
        this.apiService.deleteUser(id).subscribe(
          response => {this.loadData();},
          error => console.error('Error while deleting user!', error)
        ); 
        break;
      
      case 'roles': 
        this.apiService.deleteRole(id).subscribe(
          response => {this.loadData();},
          error => console.error('Error while deleting role! ', error)
        );
        break;
      
      case 'categories':
        this.apiService.deleteCategory(id).subscribe(
          response => {this.loadData();},
          error => console.error('Error while deleting category! ', error)
        );
        break;
    }
  }

  loadData(): void {
    switch (this.activeTab) {
      case 'users':
        this.apiService.getUsers().subscribe(
          response => this.users = response.data || [],
          error => console.error('Error while loading users! ', error)
        );
        break;

      case 'roles':
        this.apiService.getRoles().subscribe(
          response => this.roles = response.data || [],
          error => console.error('Error while loading roles! ', error)
        );
        break;

      case 'categories':
        this.apiService.getCategories().subscribe(
          response => this.categories = response.data || [],
          error => console.error('Error while loading categories! ', error)
        );
        break;
    }
  }

  // Yardımcı metodlar aynen kalacak
  getUserRoles(user: User): string {
    if (!user.roles || user.roles.length == 0){
      return 'No roles';
    }

    const roleNames = user.roles.map(asRole => asRole.role_id.role_name);
    return roleNames.join(', ');
  }

  getPermissions(role: Role): string {
    return role.permissions && role.permissions.length > 0 
      ? role.permissions.map(perm => perm.permission).join(', ') 
      : 'No permissions';
  }
}