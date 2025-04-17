import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service'; // Ensure this import
import { ApexOptions } from 'ng-apexcharts';

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

interface StatisticsData {
  dailyUsers: { dates: string[], counts: number[] };
  activeUsers: { dates: string[], counts: number[] };
  userRoles: { labels: (string | null)[], counts: number[] };
}

interface Customer {
  _id: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active: boolean;
  url_slug: string;
  created_at: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {
  // Mevcut özellikler
  activeTab: 'users' | 'roles' | 'categories' | 'statistics' | 'customers' = 'users';
  users: User[] = [];
  roles: Role[] = [];
  categories: Category[] = [];
  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  currentEntity: any = {};
  originalEntity: any = {};
  selectedPermissions: string[] = [];

  allRoles: Role[] = [];
  allPermissions: Permission[] = [];

  customers: Customer[] = [];

  statisticsData: StatisticsData | null = null;
  // Graphic options 
  dailyUsersChart: ApexOptions = {
    series: [{ name: 'New Users', data: [] }],
    chart: { type: 'line', height: 350 },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { categories: [] },
    title: { text: 'Daily New Users', align: 'left' },
    colors: ['#3F51B5']
  };

  activeUsersChart: ApexOptions = {
    series: [{ name: 'Active Users', data: [] }],
    chart: { type: 'area', height: 350 },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
    xaxis: { categories: [] },
    title: { text: 'Active Users', align: 'left' },
    colors: ['#4CAF50']
  };

  userRolesChart: ApexOptions = {
    series: [],
    chart: { type: 'pie', height: 350 },
    labels: [],
    title: { text: 'User Roles Distribution', align: 'left' },
    legend: { position: 'bottom' },
    responsive: [{
      breakpoint: 480,
      options: { chart: { width: 300 }, legend: { position: 'bottom' } }
    }]
  };


  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalItems: number = 0;
  totalPages: number = 1;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Sadece veri yükleme
    this.loadData();
    this.getAllRoles();
    this.loadStatistics();

  }

  switchTab(tab: 'users' | 'roles' | 'categories' | 'statistics' | 'customers') {
    this.activeTab = tab;
    this.loadData();
  }

  openModal(mode: 'add' | 'edit', entity?: any, event?: Event) {

    if (event) {
      event.stopPropagation();
    }

    this.modalMode = mode;
    this.isModalOpen = true;
    this.selectedPermissions = [];
    this.currentEntity = mode === 'edit' ? { ...entity } : {};



    if (mode === 'add') {
      this.currentEntity = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        is_active: true,
        roles: [],
        permissions: [],
        name: '',
        role_name: ''
      };
      this.originalEntity = {};
    } else {

      this.originalEntity = {...entity};

      // Düzenleme modunda mevcut seçimleri koru
      this.currentEntity = {
        ...entity,
        roles: entity.roles ? [...entity.roles] : [],
        permissions: entity.permissions ? [...entity.permissions] : []
      };

      if (this.activeTab === 'roles' && entity.permissions) {
        this.selectedPermissions = entity.permissions.map((perm: Permission) => perm.permission);
      }

      // Eğer roles object array olarak geliyorsa
      if (entity.roles && entity.roles.length > 0 && typeof entity.roles[0] === 'object') {
        this.currentEntity.roles = entity.roles.map((r: any) => r._id);
      }
    }

  }

  closeModal(event?: Event) {

    if (event) {
      if (event.target === event.currentTarget) {
        this.isModalOpen = false;
        this.currentEntity = {};
      }
    } else {
      this.isModalOpen = false;
      this.currentEntity = {};
    }


  }

  saveEntity(type: string) {
    // Backend izin kontrolüne güven
    switch (this.activeTab) {
      case 'users':
        if (this.modalMode === 'add') {
          this.apiService.addUser(this.currentEntity).subscribe(
            response => {
              console.log('user created!');
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => {
              console.error('Error while adding user! ', error);
              alert('error creating user! ' + error);
            }
          );
        } else {
          this.apiService.updateUser(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while editing user! ', error)
          );
        }
        break;

      case 'roles':
        if (this.modalMode === 'add') {

          const roleData = {
            role_name: this.currentEntity.role_name,
            is_active: this.currentEntity.is_active,
            permissions: this.selectedPermissions
          }

          console.log('selected permissions: ', this.selectedPermissions);
          console.log('roledata bu: ', roleData);

          this.apiService.addRole(roleData).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while adding role! ', error)
          );
        } else {

          const roleData = {
            _id: this.currentEntity._id,
            role_name: this.currentEntity.role_name,
            is_active: this.currentEntity.is_active,
            permissions: this.selectedPermissions
          }


          this.apiService.updateRole(roleData).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while updating role! ', error)
          );
        }
        break;

      case 'categories':
        if (this.modalMode === 'add') {
          this.apiService.addCategory(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while adding category! ', error)

          );
        } else {
          this.apiService.updateCategory(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while updating category! ', error)
          );
        }
        break;

      case 'customers':
        if(this.modalMode === 'add'){

          const urlSlug = this.currentEntity.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\*]+/g, '')
          .replace(/\-\-+/g, '-')
          .trim();

          this.currentEntity.url_slug = urlSlug;

          this.apiService.addCustomer(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while adding customer! ', error)
          );
        }
        else {

          if(this.currentEntity.name !== this.originalEntity.name){
            const urlSlug = this.currentEntity.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .trim();
            
            this.currentEntity.url_slug = urlSlug;
          }

          this.apiService.updateCustomer(this.currentEntity).subscribe(
            response => {
              this.loadData();
              this.currentEntity = {};
              this.closeModal();
            },
            error => console.error('Error while updating customer! ', error)
          );
        }
        break;
    }
  }

  deleteEntity(type: string, id: string) {
    // Backend izin kontrolüne güven
    if (!confirm('Are you sure you want to delete this item?')) return;

    switch (type) {
      case 'users':
        this.apiService.deleteUser(id).subscribe(
          response => { this.loadData(); },
          error => console.error('Error while deleting user!', error)
        );
        break;

      case 'roles':
        this.apiService.deleteRole(id).subscribe(
          response => { this.loadData(); },
          error => console.error('Error while deleting role! ', error)
        );
        break;

      case 'categories':
        this.apiService.deleteCategory(id).subscribe(
          response => { this.loadData(); },
          error => console.error('Error while deleting category! ', error)
        );
        break;

      case 'customers': 
      this.apiService.deleteCustomer(id).subscribe(
        response =>{ this.loadData();},
        error => console.error('Error while deleting customer! ', error)
      );
      break;
    }
      
  }

  loadData(): void {
    switch (this.activeTab) {
      case 'users':
        this.apiService.getUsers(this.currentPage, this.itemsPerPage).subscribe(
          response => {
            this.users = response.data.data;
            this.totalItems = response.data.pagination.total;
            this.totalPages = response.data.pagination.total_pages;
          },
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
      case 'customers':
        this.apiService.getCustomers().subscribe(
          response => {
            this.customers = response.data.data;
          },
          error => {
            console.error('Error while loading customers! ', error)
          }
        );
        break;
    }
  }

  // Yardımcı metodlar aynen kalacak
  getUserRoles(user: User): string {
    if (!user.roles || user.roles.length == 0) {
      return 'No roles';
    }

    const roleNames = user.roles.map(asRole => asRole.role_id.role_name);
    return roleNames.join(', ');
  }

  getPermissions(role: Role): string {

    if (role.permissions && role.permissions.length > 0) {
      return role.permissions.map(perm => perm.permission).join(', ');
    }

    return 'No permissions';

  }

  getAllRoles() {
    this.apiService.getRoles().subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.allRoles = response.data;

          this.allPermissions = this.extractUniquePermissions(response.data).filter(
            perm => perm.permission && typeof perm.permission === 'string' && perm.permission.includes('_')
          );
        }
      },
      error: (error) => {
        console.error('Error while fetching all roles!', error);
      }
    })
  }

  extractUniquePermissions(roles: Role[]): Permission[] {

    const map = new Map<string, Permission>();

    roles.forEach(role => {
      role.permissions?.forEach(perm => {
        if (!map.has(perm.permission)) {
          map.set(perm.permission, {
            _id: perm._id,
            permission: perm.permission,
            role_id: perm.role_id
          });
        }
      });
    });

    return Array.from(map.values());
  }

  isRoleSelected(roleId: string): boolean {
    return this.currentEntity.roles?.includes(roleId) || false;
  }

  toggleRoleSelection(roleId: string): void {
    if (!this.currentEntity.roles) {
      this.currentEntity.roles = [];
    }

    const index = this.currentEntity.roles.indexOf(roleId);
    if (index === -1) {
      this.currentEntity.roles.push(roleId);
    }
    else {
      this.currentEntity.roles.splice(index, 1);
    }

  }

  isPermissionSelected(permissionName: string): boolean {
    return this.selectedPermissions.includes(permissionName) || false;
  }

  togglePermission(permissionName: string): void {

    const index = this.selectedPermissions.indexOf(permissionName);

    if (index === -1) {
      this.selectedPermissions.push(permissionName);
    }
    else {
      this.selectedPermissions.splice(index, 1);
    }
  }


  loadStatistics(): void {

    this.apiService.getUserStatistics().subscribe({
      next: (response) => {
        this.statisticsData = response;
        this.updateCharts();
      },
      error: (error) => {
        console.error('Error while loading statistics', error);
      }
    });

  }

  updateCharts(): void {
    if (!this.statisticsData) return;

    // Daily Users Chart Güncelleme
    (this.dailyUsersChart.series as ApexAxisChartSeries) = [{
      name: 'New Users',
      data: this.statisticsData.dailyUsers.counts
    }];
    this.dailyUsersChart.xaxis = {
      categories: this.statisticsData.dailyUsers.dates.map(date =>
        new Date(date).toLocaleDateString('tr-TR')
      )
    };

    // Active Users Chart Güncelleme
    (this.activeUsersChart.series as ApexAxisChartSeries) = [{
      name: 'Active Users',
      data: this.statisticsData.activeUsers.counts
    }];
    this.activeUsersChart.xaxis = {
      categories: this.statisticsData.activeUsers.dates.map(date =>
        new Date(date).toLocaleDateString('tr-TR')
      )
    };

    (this.userRolesChart.series as ApexNonAxisChartSeries) = this.statisticsData.userRoles.counts;
    this.userRolesChart.labels = this.statisticsData.userRoles.labels.filter(label => label !== null) as string[];
  }

  changePage(page: number): void {

    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {

      this.currentPage = page;
      this.loadData();

    }

  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.loadData();
  }

  getPages(): number[] {

    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;

  }


  getDisplayedRange(): string{
    if(!this.totalItems) return '0 to 0 of 0 entries';

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min((this.currentPage * this.itemsPerPage), this.totalItems);
    return `${start} to ${end} of ${this.totalItems} entries`; 
  }


  copyUrlToClipboard(): void {
    const customerUrl = `http://localhost:4200/customer/${this.currentEntity.url_slug}`;

    navigator.clipboard.writeText(customerUrl).then(
      () => {
        alert('Url kopyalandı!');
      },
      (err) => {
        console.error('Url kopyalanamadı: ', err);
      }
    );

  }

}