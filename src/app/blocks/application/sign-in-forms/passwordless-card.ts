import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'SignInPasswordlessCard',
  imports: [MatCard, MatButton, MatFormField, MatInput, MatLabel, NgOptimizedImage, MatIcon],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <mat-card class="w-full max-w-sm px-8 py-12 sm:px-10">
        <img ngSrc="/images/logo/logomark.svg" width="40" height="40" alt="Logo image" />
        <div class="mt-8 text-4xl font-semibold">Sign in to your account</div>
        <div class="mt-1 flex items-center text-neutral-a11">Enter your email address to receive a verification code.</div>

        <form class="mt-8">
          <mat-form-field class="w-full">
            <mat-label>Email address</mat-label>
            <input matInput />
          </mat-form-field>

          <button class="primary mt-4 w-full" matButton>Send verification code</button>
        </form>

        <div class="mt-8 flex items-center gap-x-1">
          <div class="text-neutral-a11">Don't have an account?</div>
          <button matButton class="link">
            Get access
            <mat-icon iconPositionEnd svgIcon="move-right" />
          </button>
        </div>
      </mat-card>
    </div>
  `,
})
export class SignInPasswordlessCard {}
