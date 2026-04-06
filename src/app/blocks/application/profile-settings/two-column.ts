import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'ProfileSettingsTwoColumn',
  imports: [MatFormField, MatHint, MatInput, MatLabel, CdkTextareaAutosize, MatSelect, MatOption, MatDivider, MatButton, MatIcon, MatIconButton],
  template: `
    <form class="flex flex-col gap-y-12 sm:gap-y-16">
      <!-- Account -->
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <h2 class="text-xl font-semibold">Account</h2>
          <p class="mt-1 text-neutral-a11">Manage your public profile and account settings.</p>
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
          <div class="flex flex-col sm:col-span-full">
            <div class="font-medium">Photo</div>
            <div class="mt-2 flex items-center gap-x-4">
              <div class="flex size-10 items-center justify-center rounded-full bg-neutral-a4">
                <mat-icon svgIcon="user" class="size-5" />
              </div>
              <div class="flex items-center gap-x-2">
                <button matButton class="small">Upload</button>
                <button matIconButton class="small">
                  <mat-icon svgIcon="trash" />
                </button>
              </div>
            </div>
          </div>

          <mat-form-field class="sm:col-span-4">
            <mat-label>Email</mat-label>
            <input matInput />
          </mat-form-field>

          <mat-form-field class="sm:col-span-4">
            <mat-label>Username</mat-label>
            <input matInput />
          </mat-form-field>

          <mat-form-field class="sm:col-span-full">
            <mat-label>Bio</mat-label>
            <textarea matInput rows="2" cdkTextareaAutosize cdkAutosizeMaxRows="4"></textarea>
            <mat-hint>Write a short introduction about yourself.</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <mat-divider />

      <!-- Personal Information -->
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <h2 class="text-xl font-semibold">Personal Information</h2>
          <p class="mt-1 text-neutral-a11">Private personal information, not shared with others.</p>
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
          <mat-form-field class="sm:col-span-3">
            <mat-label>First name</mat-label>
            <input matInput />
          </mat-form-field>

          <mat-form-field class="sm:col-span-3">
            <mat-label>Last name</mat-label>
            <input matInput />
          </mat-form-field>

          <mat-form-field class="sm:col-span-4">
            <mat-label>Phone number</mat-label>
            <input matInput />
            <mat-hint>Include country code (e.g., +1 (555) 000-0000) </mat-hint>
          </mat-form-field>

          <mat-form-field class="sm:col-span-full">
            <mat-label>Address</mat-label>
            <textarea matInput rows="2" cdkTextareaAutosize cdkAutosizeMaxRows="4"></textarea>
          </mat-form-field>

          <mat-form-field class="sm:col-span-2">
            <mat-label>Postal code</mat-label>
            <input matInput />
          </mat-form-field>

          <mat-form-field class="sm:col-span-2">
            <mat-label>City</mat-label>
            <input matInput />
          </mat-form-field>

          <mat-form-field class="sm:col-span-2">
            <mat-label>Country</mat-label>
            <mat-select>
              <mat-option value="AU">Australia</mat-option>
              <mat-option value="CA">Canada</mat-option>
              <mat-option value="UK">United Kingdom</mat-option>
              <mat-option value="US">United States</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <mat-divider />

      <!-- Notification preferences -->
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <h2 class="text-xl font-semibold">Notification Preferences</h2>
          <p class="mt-1 text-neutral-a11">Choose how you would like to receive notifications.</p>
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
          <mat-form-field class="sm:col-span-4">
            <mat-label>Email notifications</mat-label>
            <mat-select>
              <mat-option value="all">All notifications</mat-option>
              <mat-option value="important">Only important</mat-option>
              <mat-option value="none">No email notifications</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="sm:col-span-4">
            <mat-label>SMS notifications</mat-label>
            <mat-select>
              <mat-option value="all">All notifications</mat-option>
              <mat-option value="important">Only important</mat-option>
              <mat-option value="none">No SMS notifications</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <mat-divider />

      <!-- Save -->
      <div class="flex justify-end gap-x-3">
        <button matButton class="tertiary">Cancel</button>
        <button matButton class="primary">Save changes</button>
      </div>
    </form>
  `,
})
export class ProfileSettingsTwoColumn {}
