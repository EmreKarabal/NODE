// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Sample data for dashboard
  totalUsers = 0;
  activeProjects = 0;
  recentActivities: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // Simulated data loading
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Simulate data fetching 
    this.totalUsers = 1245;
    this.activeProjects = 37;
    this.recentActivities = [
      { 
        id: 1, 
        description: 'New project created', 
        timestamp: new Date('2024-03-20') 
      },
      { 
        id: 2, 
        description: 'User registration', 
        timestamp: new Date('2024-03-22') 
      },
      { 
        id: 3, 
        description: 'System update completed', 
        timestamp: new Date('2024-03-24') 
      }
    ];
  }
}