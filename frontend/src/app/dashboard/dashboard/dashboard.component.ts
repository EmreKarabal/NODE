import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

// Interfaces
interface Role {
  _id: string;
  role_name: string;
  is_active: boolean;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface UserRole {
  _id: string;
  role_id: {
    _id: string;
    role_name: string;
    is_active: boolean;
  };
  user_id: string;
}

interface User {
  _id: string;
  email: string;
  is_active: boolean;
  language: string;
  roles: UserRole[];
}

interface ApiResponse<T> {
  code: number;
  data: T[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Active tab tracking
  activeTab: 'users' | 'roles' | 'categories' = 'users';

  // Data collections
  users: User[] = [];
  roles: Role[] = [];
  categories: Category[] = [];

  // Modal and form states
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  currentEntity: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.loadUsers();
    this.loadRoles();
    this.loadCategories();
  }

  // Users Methods
  loadUsers() {
    this.apiService.getUsers().subscribe(
      (response: ApiResponse<User>) => {
        this.users = response.data;
      },
      error => console.error('Error fetching users', error)
    );
  }

  getUserRoles(user: User): string {
    return user.roles.length > 0 
      ? user.roles.map(role => role.role_id.role_name).join(', ')
      : 'No Roles';
  }

  // Roles Methods
  loadRoles() {
    this.apiService.getRoles().subscribe(
      (response: ApiResponse<Role>) => {
        this.roles = response.data;
      },
      error => console.error('Error fetching roles', error)
    );
  }

  // Categories Methods
  loadCategories() {
    this.apiService.getCategories().subscribe(
      (response: ApiResponse<Category>) => {
        this.categories = response.data;
      },
      error => console.error('Error fetching categories', error)
    );
  }

  // Generic Delete Method
  deleteEntity(type: 'users' | 'roles' | 'categories', id: string) {
    let deleteMethod: (id: string) => void;

    switch(type) {
      case 'users':
        deleteMethod = (userId) => {
          this.apiService.deleteUser(userId).subscribe(
            () => {
              this.users = this.users.filter(user => user._id !== userId);
            },
            error => console.error('Error deleting user', error)
          );
        };
        break;
      case 'roles':
        deleteMethod = (roleId) => {
          this.apiService.deleteRole(roleId).subscribe(
            () => {
              this.roles = this.roles.filter(role => role._id !== roleId);
            },
            error => console.error('Error deleting role', error)
          );
        };
        break;
      case 'categories':
        deleteMethod = (categoryId) => {
          this.apiService.deleteCategory(categoryId).subscribe(
            () => {
              this.categories = this.categories.filter(cat => cat._id !== categoryId);
            },
            error => console.error('Error deleting category', error)
          );
        };
        break;
    }

    deleteMethod(id);
  }

  // Modal and Form Methods
  openModal(mode: 'add' | 'edit', entity?: any) {
    this.isModalOpen = true;
    this.modalMode = mode;
    this.currentEntity = mode === 'edit' ? {...entity} : {};
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentEntity = {};
  }

  saveEntity() {
    let saveMethod: () => void;

    switch(this.activeTab) {
      case 'users':
        saveMethod = () => {
          if (this.modalMode === 'add') {
            this.apiService.addUser(this.currentEntity).subscribe(
              (response) => {
                this.users.push(response.data);
                this.closeModal();
              },
              error => console.error('Error adding user', error)
            );
          } else {
            this.apiService.updateUser(this.currentEntity._id, this.currentEntity).subscribe(
              () => {
                const index = this.users.findIndex(u => u._id === this.currentEntity._id);
                if (index !== -1) {
                  this.users[index] = this.currentEntity;
                }
                this.closeModal();
              },
              error => console.error('Error updating user', error)
            );
          }
        };
        break;
      case 'roles':
        saveMethod = () => {
          if (this.modalMode === 'add') {
            this.apiService.addRole(this.currentEntity).subscribe(
              (response) => {
                this.roles.push(response.data);
                this.closeModal();
              },
              error => console.error('Error adding role', error)
            );
          } else {
            this.apiService.updateRole(this.currentEntity._id, this.currentEntity).subscribe(
              () => {
                const index = this.roles.findIndex(r => r._id === this.currentEntity._id);
                if (index !== -1) {
                  this.roles[index] = this.currentEntity;
                }
                this.closeModal();
              },
              error => console.error('Error updating role', error)
            );
          }
        };
        break;
      case 'categories':
        saveMethod = () => {
          if (this.modalMode === 'add') {
            this.apiService.addCategory(this.currentEntity).subscribe(
              (response) => {
                this.categories.push(response.data);
                this.closeModal();
              },
              error => console.error('Error adding category', error)
            );
          } else {
            this.apiService.updateCategory(this.currentEntity._id, this.currentEntity).subscribe(
              () => {
                const index = this.categories.findIndex(c => c._id === this.currentEntity._id);
                if (index !== -1) {
                  this.categories[index] = this.currentEntity;
                }
                this.closeModal();
              },
              error => console.error('Error updating category', error)
            );
          }
        };
        break;
    }

    saveMethod();
  }

  // Tab Switching
  switchTab(tab: 'users' | 'roles' | 'categories') {
    this.activeTab = tab;
  }
}