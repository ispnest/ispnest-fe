import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Structural directive to show/hide elements based on user permissions.
 * @example
 * ```html
 * <button *hasPermission="'CUSTOMERS_WRITE'">Create Customer</button>
 * <div *hasAnyPermission="['CUSTOMERS_READ', 'CUSTOMERS_WRITE']">...</div>
 * ```
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private cleanup: (() => void) | null = null;

  @Input() set hasPermission(permission: string | string[]) {
    // Clean up previous effect
    if (this.cleanup) {
      this.cleanup();
    }

    // Create effect to reactively update view when permissions change
    const effectRef = effect(() => {
      const permissions = Array.isArray(permission) ? permission : [permission];
      const hasPermission = permissions.some((p) => this.auth.hasPermission(p));
      this.updateView(hasPermission);
    });

    this.cleanup = () => effectRef.destroy();
  }

  private updateView(show: boolean): void {
    if (show && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!show && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}

/**
 * Structural directive to show/hide elements if user has ANY of the specified permissions.
 */
@Directive({
  selector: '[hasAnyPermission]',
  standalone: true,
})
export class HasAnyPermissionDirective implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private cleanup: (() => void) | null = null;

  @Input() set hasAnyPermission(permissions: string[]) {
    if (this.cleanup) {
      this.cleanup();
    }

    const effectRef = effect(() => {
      const hasPermission = permissions.some((p) => this.auth.hasPermission(p));
      this.updateView(hasPermission);
    });

    this.cleanup = () => effectRef.destroy();
  }

  private updateView(show: boolean): void {
    if (show && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!show && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}

/**
 * Structural directive to show/hide elements if user has ALL of the specified permissions.
 */
@Directive({
  selector: '[hasAllPermissions]',
  standalone: true,
})
export class HasAllPermissionsDirective implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private cleanup: (() => void) | null = null;

  @Input() set hasAllPermissions(permissions: string[]) {
    if (this.cleanup) {
      this.cleanup();
    }

    const effectRef = effect(() => {
      const hasPermission = permissions.every((p) => this.auth.hasPermission(p));
      this.updateView(hasPermission);
    });

    this.cleanup = () => effectRef.destroy();
  }

  private updateView(show: boolean): void {
    if (show && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!show && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}

/**
 * Structural directive to show/hide elements based on user role.
 */
@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private cleanup: (() => void) | null = null;

  @Input() set hasRole(role: string | string[]) {
    if (this.cleanup) {
      this.cleanup();
    }

    const effectRef = effect(() => {
      const roles = Array.isArray(role) ? role : [role];
      const hasRole = roles.some((r) => this.auth.hasRole(r));
      this.updateView(hasRole);
    });

    this.cleanup = () => effectRef.destroy();
  }

  private updateView(show: boolean): void {
    if (show && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!show && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}

