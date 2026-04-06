import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'SignUpSplitScreen',
  imports: [MatButton, MatFormField, MatInput, MatLabel, NgOptimizedImage, MatCheckbox, RouterLink],
  template: `
    <div class="grid flex-auto grid-cols-1 md:grid-cols-2">
      <!-- Form -->
      <div class="flex flex-auto items-center justify-center p-6 md:px-16">
        <div class="flex w-full max-w-90 flex-col">
          <img ngSrc="/images/logo/logomark.svg" width="40" height="40" alt="Logo image" />
          <div class="mt-8 text-4xl font-semibold">Create an account</div>
          <div class="mt-1 flex items-center gap-x-1 text-neutral-a11">
            Already have an account?
            <button class="link text-primary-a11 decoration-primary-a11" matButton>Sign in</button>
          </div>

          <form class="mt-8 flex flex-col">
            <div class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>Name</mat-label>
                <input matInput />
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Email address</mat-label>
                <input matInput />
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Password</mat-label>
                <input type="password" matInput />
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Password confirm</mat-label>
                <input type="password" matInput />
              </mat-form-field>
            </div>

            <mat-checkbox class="mt-4"
              >I've read
              <a class="ml-1 inline-flex font-medium text-primary-a11 decoration-primary-a11 hover:underline" routerLink=".">terms and conditions</a>
            </mat-checkbox>

            <button class="primary mt-8 w-full" matButton>Create an account</button>
          </form>
        </div>
      </div>

      <!-- Image -->
      <div class="relative hidden flex-auto md:flex">
        <img class="absolute inset-0 size-full object-cover" src="https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1920" alt="Sign-up illustration" />
      </div>
    </div>
  `,
})
export class SignUpSplitScreen {}
