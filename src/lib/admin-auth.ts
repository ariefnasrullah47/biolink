import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'moderator' | 'super_admin'
  is_active: boolean
  last_login: string | null
  created_at: string
}

export class AdminAuth {
  private static currentAdmin: AdminUser | null = null

  static async login(email: string, password: string): Promise<AdminUser> {
    try {
      // For demo purposes, we'll use hardcoded admin credentials
      if (email === 'admin@biolink.com' && password === 'admin123') {
        const adminUser: AdminUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@biolink.com',
          full_name: 'Administrator',
          role: 'super_admin',
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        }

        // Store in session
        this.currentAdmin = adminUser
        localStorage.setItem('admin_session', JSON.stringify(adminUser))
        localStorage.setItem('admin_authenticated', 'true')

        return adminUser
      } else {
        throw new Error('Kredensial admin tidak valid')
      }
    } catch (error: any) {
      console.error('Admin login error:', error)
      throw new Error(error.message || 'Login gagal')
    }
  }

  static logout(): void {
    this.currentAdmin = null
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_authenticated')
  }

  static getCurrentAdmin(): AdminUser | null {
    if (this.currentAdmin) {
      return this.currentAdmin
    }

    const stored = localStorage.getItem('admin_session')
    const authenticated = localStorage.getItem('admin_authenticated')
    
    if (stored && authenticated === 'true') {
      try {
        this.currentAdmin = JSON.parse(stored)
        return this.currentAdmin
      } catch {
        localStorage.removeItem('admin_session')
        localStorage.removeItem('admin_authenticated')
      }
    }

    return null
  }

  static isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null && localStorage.getItem('admin_authenticated') === 'true'
  }

  static hasPermission(requiredRole: string): boolean {
    const admin = this.getCurrentAdmin()
    if (!admin) return false

    const roleHierarchy = {
      'moderator': 1,
      'admin': 2,
      'super_admin': 3
    }

    const adminLevel = roleHierarchy[admin.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return adminLevel >= requiredLevel
  }
}