import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';

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
    photo: 'qzxtybs14pzdxhsxmt56d.jpg',
    name: 'Sophia Bennett',
    occupation: 'UX Designer',
  },
  {
    id: '3',
    photo: 'r1v0gr7ziwzuadynhpv9l.jpg',
    name: 'Liam Carter',
    occupation: 'DevOps Specialist',
  },
  {
    id: '4',
    photo: '8dscdy675p03e984k3bio.jpg',
    name: 'Olivia Martinez',
    occupation: 'Product Manager & Marketing Lead',
  },
  {
    id: '5',
    photo: 'd6l6k0erazgtowytjkz6u.jpg',
    name: 'Noah Kim',
    occupation: 'QA Engineer',
  },
  {
    id: '6',
    photo: 'i26glj5ogfrlo5mhggfx2.jpg',
    name: 'Ethan Roberto Rodriguez',
    occupation: 'Mobile Developer',
  },
];

@Component({
  selector: 'GridListContactsWithBigPhotos',
  imports: [MatCard],
  template: `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-12 md:grid-cols-3">
      @for (contact of contacts; track contact.id) {
        <mat-card class="group relative isolate flex aspect-8/9 flex-col border-0 p-1">
          <!-- Photo -->
          <img class="absolute inset-0 size-full rounded-xl object-cover outline -outline-offset-1 outline-black-a2 grayscale transition-all group-hover:grayscale-0 dark:outline-white-a2" [src]="'images/photos/' + contact.photo" [alt]="contact.name" />

          <!-- Name & Occupation -->
          <div class="z-10 mt-auto min-w-0 items-center gap-x-4 rounded-lg bg-black-a5 p-4 outline outline-white-a4 backdrop-blur-sm">
            <div class="truncate text-xl font-medium tracking-tight text-white">{{ contact.name }}</div>
            <div class="mt-1 truncate text-white-a10">{{ contact.occupation }}</div>
          </div>
        </mat-card>
      }
    </div>
  `,
})
export class GridListContactsWithBigPhotos {
  // Data
  protected contacts = contacts;
}
