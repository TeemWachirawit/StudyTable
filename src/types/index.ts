export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage?: string;
}

