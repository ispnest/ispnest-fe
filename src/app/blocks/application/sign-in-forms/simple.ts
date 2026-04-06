import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'SignInSimple',
  imports: [MatButton, MatFormField, MatInput, MatLabel, MatCheckbox, NgOptimizedImage],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <div class="flex w-full max-w-90 flex-col">
        <img ngSrc="/images/logo/logomark.svg" width="40" height="40" alt="Logo image" />
        <div class="mt-8 text-4xl font-semibold">Sign in to your account</div>
        <div class="mt-1 flex items-center gap-x-1 text-neutral-a11">
          Don't have an account?
          <button class="link text-primary-a11 decoration-primary-a11" matButton>Sign up</button>
        </div>

        <form class="mt-8 flex flex-col">
          <div class="flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Email address</mat-label>
              <input matInput />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Password</mat-label>
              <input type="password" matInput />
            </mat-form-field>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <mat-checkbox>Remember me</mat-checkbox>
            <a class="link text-primary-a11 decoration-primary-a11" matButton>Forgot password?</a>
          </div>

          <button class="primary mt-8 w-full" matButton>Sign in</button>
        </form>
      </div>
    </div>
  `,
})
export class SignInSimple {}
