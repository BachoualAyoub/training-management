import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private readonly ADMIN_PASSWORD = '12345678';

  constructor(private router: Router) {}

  canActivate(): boolean {
    const password = prompt('Enter admin password:');
    if (password === this.ADMIN_PASSWORD) {
      return true;
    }
    alert('Invalid password');
    this.router.navigate(['']);
    return false;
  }
}