import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'NotificationSettingsStackedWithToggles',
  imports: [MatDivider, MatButton, MatSlideToggle],
  template: `
    <form class="flex flex-col gap-y-12 sm:gap-y-16">
      <!-- Email Notifications -->
      <div class="flex flex-col gap-y-12">
        <div>
          <h2 class="text-xl font-semibold">Email Notifications</h2>
          <p class="mt-1 text-neutral-a11">Control which activities trigger email alerts in your inbox.</p>
        </div>

        <!-- Section -->
        <div class="flex flex-col">
          <div class="text-lg font-medium">General Updates</div>
          <div class="mt-6 flex flex-col gap-y-6">
            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>Product news and updates</div>
              <div class="text-sm text-neutral-a11">Get notified about new features and product improvements.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start">
              <div>Security alerts</div>
              <div class="text-sm text-neutral-a11">Receive important messages about account logins and security issues.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start">
              <div>Weekly summary</div>
              <div class="text-sm text-neutral-a11">A short recap of your projects and activity sent once a week.</div>
            </mat-slide-toggle>
          </div>
        </div>

        <!-- Section -->
        <div class="flex flex-col">
          <div class="text-lg font-medium">Project Notifications</div>
          <div class="mt-6 flex flex-col gap-y-6">
            <mat-slide-toggle class="[&>.mdc-form-field]:items-start">
              <div>Project invitations</div>
              <div class="text-sm text-neutral-a11">Alerts you when someone adds you to a new project.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>Mentions in tasks</div>
              <div class="text-sm text-neutral-a11">Sends an email when someone mentions you in a comment or update.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>Task completion updates</div>
              <div class="text-sm text-neutral-a11">Get notified when tasks assigned to you are marked as complete.</div>
            </mat-slide-toggle>
          </div>
        </div>
      </div>

      <mat-divider />

      <!-- Push Notifications -->
      <div class="flex flex-col gap-y-12">
        <div>
          <h2 class="text-xl font-semibold">Push Notifications</h2>
          <p class="mt-1 text-neutral-a11">Control which events trigger notifications on your device.</p>
        </div>

        <!-- Section -->
        <div class="flex flex-col">
          <div class="text-lg font-medium">System Events</div>
          <div class="mt-6 flex flex-col gap-y-6">
            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>System alerts</div>
              <div class="text-sm text-neutral-a11">Keep informed about scheduled maintenance or service downtime.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>Billing updates</div>
              <div class="text-sm text-neutral-a11">Receive push alerts for billing changes or failed payments.</div>
            </mat-slide-toggle>
          </div>
        </div>

        <!-- Section -->
        <div class="flex flex-col">
          <div class="text-lg font-medium">Collaboration</div>
          <div class="mt-6 flex flex-col gap-y-6">
            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>Team invitations</div>
              <div class="text-sm text-neutral-a11">Get notified when someone invites you to join a team.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start">
              <div>Comments and replies</div>
              <div class="text-sm text-neutral-a11">Instant alerts when teammates comment or reply to your updates.</div>
            </mat-slide-toggle>

            <mat-slide-toggle class="[&>.mdc-form-field]:items-start" checked>
              <div>Direct messages</div>
              <div class="text-sm text-neutral-a11">Push notifications for new private conversations.</div>
            </mat-slide-toggle>
          </div>
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
export class NotificationSettingsStackedWithToggles {}
