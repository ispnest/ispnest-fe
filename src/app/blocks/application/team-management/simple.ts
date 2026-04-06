import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

const currentMembers = [
  {
    id: 1,
    photo: '1qomnajv82pxv2laucaic.jpg',
    name: 'Gloria Metz',
    email: 'gloria.metz@example.com',
    role: 'owner',
  },
  {
    id: 2,
    photo: 'vq3hfstwwku7ghfmf491o.jpg',
    name: 'Lowell Lind',
    email: 'lowell.lind@example.com',
    role: 'admin',
  },
  {
    id: 3,
    photo: '4ub7cws3f0mjgl5572khj.jpg',
    name: 'Adrianne Pena',
    email: 'adrianne.pena@example.com',
    role: 'member',
  },
];

const pendingInvitations = [
  {
    id: 1,
    email: 'leticia.yundt@example.com',
    role: 'member',
  },
  {
    id: 2,
    email: 'janae.marks@example.com',
    role: 'member',
  },
];

@Component({
  selector: 'TeamManagementSimple',
  imports: [MatFormField, MatInput, MatButton, MatDivider, NgOptimizedImage, MatIcon, MatMenu, MatMenuTrigger, MatIconButton, MatMenuItem, TitleCasePipe],
  template: `
    <div class="flex flex-col gap-y-10">
      <div>
        <h2 class="text-xl font-semibold">Your team</h2>
        <p class="mt-1 text-neutral-a11">Manage your team members and their access to the project.</p>
      </div>

      <div class="flex items-center gap-x-3">
        <mat-form-field class="flex-auto">
          <input matInput placeholder="Enter an email address" />
        </mat-form-field>
        <button matButton class="primary">Send invite</button>
      </div>

      <!-- Team members -->
      <div class="flex flex-col gap-y-4">
        <div class="font-medium text-neutral-a11">Current members</div>
        <mat-divider />
        @for (member of currentMembers; track member.id; let last = $last) {
          <div class="flex items-center gap-x-4">
            <!-- Image -->
            <img [ngSrc]="'/images/photos/' + member.photo" width="32" height="32" [alt]="member.name" class="rounded-full" />

            <!-- Information -->
            <div class="min-w-0 flex-auto">
              <div class="truncate font-medium">{{ member.name }}</div>
              <div class="truncate text-sm text-neutral-a11">{{ member.email }}</div>
            </div>

            <!-- Role -->
            <div class="rounded bg-neutral-a4 px-1.5 py-0.5 text-xs font-medium text-neutral-a11">{{ member.role | titlecase }}</div>

            <!-- Actions -->
            <button matIconButton [matMenuTriggerFor]="memberActions" class="small">
              <mat-icon svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu xPosition="before" #memberActions="matMenu">
              <button mat-menu-item>
                <mat-icon svgIcon="user-pen" />
                Change user role
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="lock-keyhole" />
                Reset password
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="user-lock" />
                Block access
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="user-x" />
                Remove from team
              </button>
            </mat-menu>
          </div>
          @if (!last) {
            <mat-divider />
          }
        }
      </div>

      <div class="flex flex-col gap-y-4">
        <div class="font-medium text-neutral-a11">Pending invites</div>
        <mat-divider />
        @for (member of pendingInvitations; track member.id; let last = $last) {
          <div class="flex items-center gap-x-4">
            <!-- Image -->
            <div class="flex size-8 items-center justify-center rounded-full bg-neutral-a6">
              <mat-icon svgIcon="user" class="size-4" />
            </div>

            <!-- Information -->
            <div class="flex-auto truncate">{{ member.email }}</div>

            <!-- Role -->
            <div class="rounded bg-neutral-a4 px-1.5 py-0.5 text-xs font-medium text-neutral-a11">{{ member.role | titlecase }}</div>

            <!-- Actions -->
            <button matIconButton [matMenuTriggerFor]="pendingActions" class="small">
              <mat-icon svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu xPosition="before" #pendingActions="matMenu">
              <button mat-menu-item>
                <mat-icon svgIcon="mail-open" />
                Resend invitation
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="shredder" />
                Cancel invitation
              </button>
            </mat-menu>
          </div>
          @if (!last) {
            <mat-divider />
          }
        }
      </div>
    </div>
  `,
})
export class TeamManagementSimple {
  // State
  protected currentMembers = currentMembers;
  protected pendingInvitations = pendingInvitations;
}
