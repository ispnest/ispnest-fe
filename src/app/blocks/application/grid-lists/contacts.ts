import { NgOptimizedImage, SlicePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

type Contact = {
  id: string;
  photo: string | null;
  name: string;
  occupation: string;
};

const contacts: Contact[] = [
  {
    id: '1',
    photo: '4ub7cws3f0mjgl5572khj.jpg',
    name: 'Evelyn Harper',
    occupation: 'Frontend Developer',
  },
  {
    id: '2',
    photo: null,
    name: 'Marcus Lee',
    occupation: 'Backend Engineer',
  },
  {
    id: '3',
    photo: null,
    name: 'Sophia Bennett',
    occupation: 'UX Designer',
  },
  {
    id: '4',
    photo: '4br10olncbmhtdk4j5vkd.jpg',
    name: 'Liam Carter',
    occupation: 'DevOps Specialist',
  },
  {
    id: '5',
    photo: '8dscdy675p03e984k3bio.jpg',
    name: 'Olivia Martinez',
    occupation: 'Product Manager & Marketing Lead',
  },
  {
    id: '6',
    photo: 'd6l6k0erazgtowytjkz6u.jpg',
    name: 'Noah Kim',
    occupation: 'QA Engineer',
  },
  {
    id: '7',
    photo: null,
    name: 'Grace Peterson',
    occupation: 'Data Scientist',
  },
  {
    id: '8',
    photo: 'i26glj5ogfrlo5mhggfx2.jpg',
    name: 'Ethan Roberto Rodriguez',
    occupation: 'Mobile Developer',
  },
];

@Component({
  selector: 'GridListContacts',
  imports: [MatCard, MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatDivider, SlicePipe, NgOptimizedImage],
  template: `
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      @for (contact of contacts; track contact.id) {
        <mat-card class="flex flex-col p-5">
          <div class="flex items-center gap-x-4">
            <!-- Photo -->
            @if (contact.photo) {
              <img [ngSrc]="'/images/photos/' + contact.photo" width="40" height="40" [alt]="contact.name" class="rounded-full object-cover outline -outline-offset-1 outline-black-a2 dark:outline-white-a2" />
            } @else {
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-a4 text-xl font-medium outline -outline-offset-1 outline-black-a1 dark:outline-white-a1">{{ contact.name | slice: 0 : 1 }}</div>
            }

            <!-- Name & Occupation -->
            <div class="min-w-0">
              <div class="truncate text-lg font-medium tracking-tight">{{ contact.name }}</div>
              <div class="truncate text-neutral-a11">{{ contact.occupation }}</div>
            </div>

            <!-- Menu -->
            <button matIconButton [matMenuTriggerFor]="contactMenu" class="ml-auto">
              <mat-icon svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu #contactMenu="matMenu">
              <button mat-menu-item>
                <mat-icon svgIcon="pencil" />
                Edit
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="archive" />
                Archive
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="trash" />
                Delete
              </button>
            </mat-menu>
          </div>
        </mat-card>
      }
    </div>
  `,
})
export class GridListContacts {
  // Data
  protected contacts = contacts;
}
