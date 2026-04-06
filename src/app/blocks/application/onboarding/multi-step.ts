import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/input';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'OnboardingMultiStep',
  imports: [MatButton, NgOptimizedImage, MatIcon, MatSelectionList, MatListOption, MatFormField, MatSelect, MatOption],
  template: `
    <div class="grid flex-auto grid-cols-1 md:grid-cols-3">
      <!-- Image -->
      <div class="relative hidden flex-auto md:flex">
        <img class="absolute inset-0 size-full object-cover" src="https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1920" alt="Sign-up illustration" />
      </div>

      <!-- Content -->
      <div class="col-span-2 flex flex-auto items-center justify-center p-6 md:px-16">
        <div class="flex w-full max-w-lg flex-col gap-y-10">
          @let currentStep = this.currentStep();

          <!-- Logo -->
          <img ngSrc="/images/logo/logomark.svg" width="40" height="40" alt="Logo image" />

          <!-- Progress -->
          <div class="flex items-center gap-x-3">
            @for (bar of progressTotal; track $index; let index = $index) {
              <div class="h-1 flex-auto rounded-full" [class.bg-primary]="currentStep >= index + 1" [class.bg-neutral-a4]="currentStep < index + 1"></div>
            }
          </div>

          <!-- Steps -->
          <div class="flex flex-col gap-y-10">
            @if (currentStep === 1) {
              <!-- Step 1 -->
              <div class="w-full max-w-lg">
                <div class="text-3xl font-semibold">What type of projects will you build?</div>
                <div class="mt-2 flex items-center gap-x-1 text-lg text-pretty text-neutral-a11">Select all the project types that best match what you’re planning to work on. You can choose more than one.</div>
              </div>

              <mat-selection-list class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                @for (option of projectOptions; track option.id) {
                  <mat-list-option class="relative gap-x-1 overflow-hidden rounded-lg border p-4 has-checked:border-primary-a6 has-checked:bg-primary-a3 [&_.mdc-checkbox]:hidden">
                    {{ option.title }}
                  </mat-list-option>
                }
              </mat-selection-list>
            } @else if (currentStep === 2) {
              <!-- Step 2 -->
              <div class="w-full max-w-lg">
                <div class="text-3xl font-semibold">Can you tell us about your company?</div>
                <div class="mt-2 flex items-center gap-x-1 text-lg text-pretty text-neutral-a11">We’d love to learn a bit more about the organization you’re building for. This helps tailor the setup experience.</div>
              </div>

              <div>
                <div class="text-xl font-medium">What best describes your company?</div>
                <mat-selection-list class="mt-4 flex flex-row flex-wrap gap-3">
                  @for (option of companyOptions; track option.id) {
                    <mat-list-option class="relative w-auto gap-0 overflow-hidden rounded-lg border px-3 py-1.5 not-[has-checked]:text-neutral-a10 has-checked:border-primary-a6 has-checked:bg-primary-a3 [&_.mdc-checkbox]:hidden">
                      <div class="font-medium whitespace-normal">{{ option.title }}</div>
                    </mat-list-option>
                  }
                </mat-selection-list>
              </div>

              <div>
                <div class="text-xl font-medium">How large is your company or team?</div>
                <mat-form-field class="mt-4 w-full">
                  <mat-select placeholder="Select company size">
                    @for (option of companySizeOptions; track option.id) {
                      <mat-option [value]="option.id">{{ option.title }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            } @else if (currentStep === 3) {
              <!-- Step 3 -->
              <div class="w-full max-w-lg">
                <div class="text-3xl font-semibold">Tell us about your role</div>
                <div class="mt-2 flex items-center gap-x-1 text-lg text-pretty text-neutral-a11">Select the role that best matches what you do.</div>
              </div>

              <mat-selection-list class="flex flex-col gap-3" [multiple]="false">
                @for (option of roleOptions; track option.id) {
                  <mat-list-option class="relative w-auto gap-0 overflow-hidden rounded-lg border p-4 not-[has-checked]:text-neutral-a10 has-checked:border-primary-a6 has-checked:bg-primary-a3 [&_.mdc-radio]:hidden">
                    <div class="font-medium whitespace-normal">{{ option.title }}</div>
                  </mat-list-option>
                }
              </mat-selection-list>
            } @else if (currentStep === 4) {
              <!-- Step 4 -->
              <div class="w-full max-w-lg">
                <div class="text-3xl font-semibold">You are all set!</div>
                <div class="mt-2 flex items-center gap-x-1 text-lg text-pretty text-neutral-a11">Your setup is complete. You can now start exploring your workspace.</div>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-x-4">
            @if (currentStep > 1) {
              <button matButton (click)="goToPreviousStep()">
                <mat-icon svgIcon="move-left" />
                Go back
              </button>
            } @else {
              <button matButton class="link">Skip for now</button>
            }

            @if (currentStep < steps) {
              <button matButton class="primary" (click)="goToNextStep()">Continue</button>
            } @else {
              <button matButton class="primary">Finish</button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OnboardingMultiStep {
  // State
  protected steps = 4;
  protected readonly currentStep = signal(1);
  protected progressTotal = Array(this.steps);

  protected projectOptions = [
    {
      id: 'dashboard',
      title: 'Dashboard',
    },
    {
      id: 'admin-panel',
      title: 'Admin Panel',
    },
    {
      id: 'crm-system',
      title: 'CRM System',
    },
    {
      id: 'e-commerce',
      title: 'E-commerce',
    },
    {
      id: 'saas-platform',
      title: 'SaaS Platform',
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
    },
    {
      id: 'marketing-site',
      title: 'Marketing Site',
    },
    {
      id: 'other',
      title: 'Other',
    },
  ];

  protected companyOptions = [
    {
      id: 'tech-startup',
      title: 'Tech Startup',
    },
    {
      id: 'software-agency',
      title: 'Software Agency',
    },
    {
      id: 'enterprise-business',
      title: 'Enterprise Business',
    },
    {
      id: 'consulting-firm',
      title: 'Consulting Firm',
    },
    {
      id: 'legal-financial',
      title: 'Legal / Financial',
    },
    {
      id: 'university-education',
      title: 'University / Education',
    },
    {
      id: 'freelancer-independent',
      title: 'Freelancer / Independent',
    },
    {
      id: 'non-profit',
      title: 'Non-profit',
    },
    {
      id: 'other',
      title: 'Other',
    },
  ];

  protected companySizeOptions = [
    {
      id: '1-5',
      title: '1-5',
    },
    {
      id: '11-50',
      title: '11-50',
    },
    {
      id: '51-200',
      title: '51-200',
    },
    {
      id: '200+',
      title: '200+',
    },
  ];

  protected roleOptions = [
    {
      id: 'developer',
      title: 'Developer',
      description: 'Building and maintaining applications or products.',
    },
    {
      id: 'designer',
      title: 'Designer',
      description: 'Working on UX, UI, and user flows.',
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      description: 'Defining features and overseeing product direction.',
    },
    {
      id: 'project-manager',
      title: 'Project Manager',
      description: 'Coordinating tasks, teams, and delivery timelines.',
    },
    {
      id: 'marketer',
      title: 'Marketer',
      description: 'Managing growth, campaigns, and brand communication.',
    },
    {
      id: 'other',
      title: 'Other',
    },
  ];

  goToNextStep() {
    if (this.currentStep() < this.steps) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  goToPreviousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }
}
